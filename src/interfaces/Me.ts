// To parse this data:
//
//   import { Convert, Me } from "./file";
//
//   const me = Convert.toMe(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Me {
    created_at:         number;
    email:              string;
    facebook_connected: boolean;
    id:                 string;
    image_url:          string;
    locale:             string;
    name:               string;
    phone_number:       string;
    sms:                boolean;
    twitter_connected:  boolean;
    updated_at:         number;
    user_id:            string;
    zip_code:           null;
    share_url:          string;
    share_qr_code_url:  string;
    mfa:                Mfa;
    tags:               string[];
    prompt_for_survey:  boolean;
    show_age_gate:      boolean;
    birth_date_set:     boolean;
}

export interface Mfa {
    enabled:  boolean;
    channels: Channel[];
}

export interface Channel {
    type:       string;
    created_at: number;
}

// Converts JSON types to/from your types
// and asserts the results at runtime
export class Convert {
    public static toMe(json: any): Me {
        return cast(json, r("Me"));
    }

    public static meToJson(value: Me): any {
        return uncast(value, r("Me"));
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
    "Me": o([
        { json: "created_at", js: "created_at", typ: 0 },
        { json: "email", js: "email", typ: "" },
        { json: "facebook_connected", js: "facebook_connected", typ: true },
        { json: "id", js: "id", typ: "" },
        { json: "image_url", js: "image_url", typ: "" },
        { json: "locale", js: "locale", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "phone_number", js: "phone_number", typ: "" },
        { json: "sms", js: "sms", typ: true },
        { json: "twitter_connected", js: "twitter_connected", typ: true },
        { json: "updated_at", js: "updated_at", typ: 0 },
        { json: "user_id", js: "user_id", typ: "" },
        { json: "zip_code", js: "zip_code", typ: null },
        { json: "share_url", js: "share_url", typ: "" },
        { json: "share_qr_code_url", js: "share_qr_code_url", typ: "" },
        { json: "mfa", js: "mfa", typ: r("Mfa") },
        { json: "tags", js: "tags", typ: a("") },
        { json: "prompt_for_survey", js: "prompt_for_survey", typ: true },
        { json: "show_age_gate", js: "show_age_gate", typ: true },
        { json: "birth_date_set", js: "birth_date_set", typ: true },
    ], false),
    "Mfa": o([
        { json: "enabled", js: "enabled", typ: true },
        { json: "channels", js: "channels", typ: a(r("Channel")) },
    ], false),
    "Channel": o([
        { json: "type", js: "type", typ: "" },
        { json: "created_at", js: "created_at", typ: 0 },
    ], false),
};
