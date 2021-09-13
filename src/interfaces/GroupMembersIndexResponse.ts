// To parse this data:
//
//   import { Convert, MembersIndexResponse, StatefulAPIMember, Role, State } from "./file";
//
//   const membersIndexResponse = Convert.toMembersIndexResponse(json);
//   const statefulAPIMember = Convert.toStatefulAPIMember(json);
//   const role = Convert.toRole(json);
//   const state = Convert.toState(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface MembersIndexResponse {
    memberships: StatefulAPIMember[];
}

export interface StatefulAPIMember {
    autokicked?: boolean;
    id:          string;
    image_url?:  string;
    muted?:      boolean;
    name:        string;
    nickname:    string;
    roles:       Role[];
    state:       State;
    user_id:     string;
}

export enum Role {
    Admin = "admin",
    Owner = "owner",
    User = "user",
}

export enum State {
    Active = "active",
    Exited = "exited",
    ExitedRemoved = "exited_removed",
    Removed = "removed",
}

// Converts JSON types to/from your types
// and asserts the results at runtime
export class Convert {
    public static toMembersIndexResponse(json: any): MembersIndexResponse {
        return cast(json, r("MembersIndexResponse"));
    }

    public static membersIndexResponseToJson(value: MembersIndexResponse): any {
        return uncast(value, r("MembersIndexResponse"));
    }

    public static toStatefulAPIMember(json: any): StatefulAPIMember {
        return cast(json, r("StatefulAPIMember"));
    }

    public static statefulAPIMemberToJson(value: StatefulAPIMember): any {
        return uncast(value, r("StatefulAPIMember"));
    }

    public static toRole(json: any): Role {
        return cast(json, r("Role"));
    }

    public static roleToJson(value: Role): any {
        return uncast(value, r("Role"));
    }

    public static toState(json: any): State {
        return cast(json, r("State"));
    }

    public static stateToJson(value: State): any {
        return uncast(value, r("State"));
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
    "MembersIndexResponse": o([
        { json: "memberships", js: "memberships", typ: a(r("StatefulAPIMember")) },
    ], "any"),
    "StatefulAPIMember": o([
        { json: "autokicked", js: "autokicked", typ: u(undefined, true) },
        { json: "id", js: "id", typ: "" },
        { json: "image_url", js: "image_url", typ: u(undefined, "") },
        { json: "muted", js: "muted", typ: u(undefined, true) },
        { json: "name", js: "name", typ: "" },
        { json: "nickname", js: "nickname", typ: "" },
        { json: "roles", js: "roles", typ: a(r("Role")) },
        { json: "state", js: "state", typ: r("State") },
        { json: "user_id", js: "user_id", typ: "" },
    ], "any"),
    "Role": [
        "admin",
        "owner",
        "user",
    ],
    "State": [
        "active",
        "exited",
        "exited_removed",
        "removed",
    ],
};
