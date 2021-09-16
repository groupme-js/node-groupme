// To parse this data:
//
//   import { Convert, PollsIndexResponse, APIPoll, Data, PollStatus, PollType, PollVisibility, Option } from "./file";
//
//   const pollsIndexResponse = Convert.toPollsIndexResponse(json);
//   const aPIPoll = Convert.toAPIPoll(json);
//   const data = Convert.toData(json);
//   const pollStatus = Convert.toPollStatus(json);
//   const pollType = Convert.toPollType(json);
//   const pollVisibility = Convert.toPollVisibility(json);
//   const option = Convert.toOption(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface PollsIndexResponse {
    continuation_token: string;
    polls:              APIPoll[];
}

export interface APIPoll {
    data:        Data;
    user_vote?:  string;
    user_votes?: string[];
}

export interface Data {
    conversation_id: string;
    created_at:      number;
    expiration:      number;
    id:              string;
    last_modified:   number;
    options:         Option[];
    owner_id:        string;
    status:          PollStatus;
    subject:         string;
    type:            PollType;
    visibility:      PollVisibility;
}

export interface Option {
    id:         string;
    title:      string;
    voter_ids?: string[];
    votes?:     number;
}

export enum PollStatus {
    Active = "active",
    Past = "past",
}

export enum PollType {
    Multi = "multi",
    Single = "single",
}

export enum PollVisibility {
    Anonymous = "anonymous",
    Public = "public",
}

// Converts JSON types to/from your types
// and asserts the results at runtime
export class Convert {
    public static toPollsIndexResponse(json: any): PollsIndexResponse {
        return cast(json, r("PollsIndexResponse"));
    }

    public static pollsIndexResponseToJson(value: PollsIndexResponse): any {
        return uncast(value, r("PollsIndexResponse"));
    }

    public static toAPIPoll(json: any): APIPoll {
        return cast(json, r("APIPoll"));
    }

    public static aPIPollToJson(value: APIPoll): any {
        return uncast(value, r("APIPoll"));
    }

    public static toData(json: any): Data {
        return cast(json, r("Data"));
    }

    public static dataToJson(value: Data): any {
        return uncast(value, r("Data"));
    }

    public static toPollStatus(json: any): PollStatus {
        return cast(json, r("PollStatus"));
    }

    public static pollStatusToJson(value: PollStatus): any {
        return uncast(value, r("PollStatus"));
    }

    public static toPollType(json: any): PollType {
        return cast(json, r("PollType"));
    }

    public static pollTypeToJson(value: PollType): any {
        return uncast(value, r("PollType"));
    }

    public static toPollVisibility(json: any): PollVisibility {
        return cast(json, r("PollVisibility"));
    }

    public static pollVisibilityToJson(value: PollVisibility): any {
        return uncast(value, r("PollVisibility"));
    }

    public static toOption(json: any): Option {
        return cast(json, r("Option"));
    }

    public static optionToJson(value: Option): any {
        return uncast(value, r("Option"));
    }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`, );
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases, val);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val);
    }
    if (typ === false) return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "PollsIndexResponse": o([
        { json: "continuation_token", js: "continuation_token", typ: "" },
        { json: "polls", js: "polls", typ: a(r("APIPoll")) },
    ], "any"),
    "APIPoll": o([
        { json: "data", js: "data", typ: r("Data") },
        { json: "user_vote", js: "user_vote", typ: u(undefined, "") },
        { json: "user_votes", js: "user_votes", typ: u(undefined, a("")) },
    ], "any"),
    "Data": o([
        { json: "conversation_id", js: "conversation_id", typ: "" },
        { json: "created_at", js: "created_at", typ: 3.14 },
        { json: "expiration", js: "expiration", typ: 3.14 },
        { json: "id", js: "id", typ: "" },
        { json: "last_modified", js: "last_modified", typ: 3.14 },
        { json: "options", js: "options", typ: a(r("Option")) },
        { json: "owner_id", js: "owner_id", typ: "" },
        { json: "status", js: "status", typ: r("PollStatus") },
        { json: "subject", js: "subject", typ: "" },
        { json: "type", js: "type", typ: r("PollType") },
        { json: "visibility", js: "visibility", typ: r("PollVisibility") },
    ], "any"),
    "Option": o([
        { json: "id", js: "id", typ: "" },
        { json: "title", js: "title", typ: "" },
        { json: "voter_ids", js: "voter_ids", typ: u(undefined, a("")) },
        { json: "votes", js: "votes", typ: u(undefined, 3.14) },
    ], "any"),
    "PollStatus": [
        "active",
        "past",
    ],
    "PollType": [
        "multi",
        "single",
    ],
    "PollVisibility": [
        "anonymous",
        "public",
    ],
};
