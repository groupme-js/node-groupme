// To parse this data:
//
//   import { Convert } from "./file";
//
//   const chatsIndexResponse = Convert.toChatsIndexResponse(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface ChatsIndexResponse {
    created_at:              number;
    last_message:            LastMessage;
    messages_count:          number;
    other_user:              OtherUser;
    updated_at:              number;
    message_deletion_period: number;
    message_deletion_mode:   MessageDeletionMode[];
}

export interface LastMessage {
    attachments:     Attachment[];
    avatar_url:      null | string;
    conversation_id: string;
    created_at:      number;
    favorited_by:    any[];
    id:              string;
    name:            string;
    recipient_id:    string;
    sender_id:       string;
    sender_type:     SenderType;
    source_guid:     string;
    text:            string;
    user_id:         string;
}

export interface Attachment {
    charmap?:     Array<number[]>;
    placeholder?: string;
    type:         string;
    url?:         string;
    preview_url?: string;
}

export enum SenderType {
    User = "user",
}

export enum MessageDeletionMode {
    Creator = "creator",
    Sender = "sender",
}

export interface OtherUser {
    avatar_url: string;
    id:         string;
    name:       string;
}

// Converts JSON types to/from your types
// and asserts the results at runtime
export class Convert {
    public static toChatsIndexResponse(json: any): ChatsIndexResponse[] {
        return cast(json, a(r("ChatsIndexResponse")));
    }

    public static chatsIndexResponseToJson(value: ChatsIndexResponse[]): any {
        return uncast(value, a(r("ChatsIndexResponse")));
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
    "ChatsIndexResponse": o([
        { json: "created_at", js: "created_at", typ: 0 },
        { json: "last_message", js: "last_message", typ: r("LastMessage") },
        { json: "messages_count", js: "messages_count", typ: 0 },
        { json: "other_user", js: "other_user", typ: r("OtherUser") },
        { json: "updated_at", js: "updated_at", typ: 0 },
        { json: "message_deletion_period", js: "message_deletion_period", typ: 0 },
        { json: "message_deletion_mode", js: "message_deletion_mode", typ: a(r("MessageDeletionMode")) },
    ], false),
    "LastMessage": o([
        { json: "attachments", js: "attachments", typ: a(r("Attachment")) },
        { json: "avatar_url", js: "avatar_url", typ: u(null, "") },
        { json: "conversation_id", js: "conversation_id", typ: "" },
        { json: "created_at", js: "created_at", typ: 0 },
        { json: "favorited_by", js: "favorited_by", typ: a("any") },
        { json: "id", js: "id", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "recipient_id", js: "recipient_id", typ: "" },
        { json: "sender_id", js: "sender_id", typ: "" },
        { json: "sender_type", js: "sender_type", typ: r("SenderType") },
        { json: "source_guid", js: "source_guid", typ: "" },
        { json: "text", js: "text", typ: "" },
        { json: "user_id", js: "user_id", typ: "" },
    ], false),
    "Attachment": o([
        { json: "charmap", js: "charmap", typ: u(undefined, a(a(0))) },
        { json: "placeholder", js: "placeholder", typ: u(undefined, "") },
        { json: "type", js: "type", typ: "" },
        { json: "url", js: "url", typ: u(undefined, "") },
        { json: "preview_url", js: "preview_url", typ: u(undefined, "") },
    ], false),
    "OtherUser": o([
        { json: "avatar_url", js: "avatar_url", typ: "" },
        { json: "id", js: "id", typ: "" },
        { json: "name", js: "name", typ: "" },
    ], false),
    "SenderType": [
        "user",
    ],
    "MessageDeletionMode": [
        "creator",
        "sender",
    ],
};
