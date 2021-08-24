// To parse this data:
//
//   import { Convert } from "./file";
//
//   const groupsIndexResponse = Convert.toGroupsIndexResponse(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface GroupsIndexResponse {
    id:                      string;
    group_id:                string;
    name:                    string;
    phone_number:            string;
    type:                    Type;
    description:             string;
    image_url:               null | string;
    creator_user_id:         string;
    created_at:              number;
    updated_at:              number;
    muted_until:             number | null;
    office_mode:             boolean;
    share_url:               string;
    share_qr_code_url:       string;
    members:                 Member[];
    messages:                Messages;
    max_members:             number;
    theme_name:              null | string;
    like_icon:               LikeIcon | null;
    requires_approval:       boolean;
    show_join_question:      boolean;
    join_question:           null;
    message_deletion_period: number;
    message_deletion_mode:   MessageDeletionMode[];
}

export interface LikeIcon {
    type:       string;
    pack_id:    number;
    pack_index: number;
}

export interface Member {
    user_id:    string;
    nickname:   string;
    image_url:  null | string;
    id:         string;
    muted:      boolean;
    autokicked: boolean;
    roles:      Role[];
    name:       string;
}

export enum Role {
    Admin = "admin",
    Owner = "owner",
    User = "user",
}

export enum MessageDeletionMode {
    Creator = "creator",
    Sender = "sender",
}

export interface Messages {
    count:                   number;
    last_message_id:         string;
    last_message_created_at: number;
    preview:                 Preview;
}

export interface Preview {
    nickname:        null | string;
    text:            null | string;
    image_url:       null | string;
    attachments:     Attachment[];
    deleted_at?:     number;
    deletion_actor?: MessageDeletionMode;
}

export interface Attachment {
    type:         string;
    url?:         string;
    charmap?:     Array<number[]>;
    placeholder?: string;
    loci?:        Array<number[]>;
    user_ids?:    string[];
}

export enum Type {
    Closed = "closed",
    Private = "private",
}

// Converts JSON types to/from your types
// and asserts the results at runtime
export class Convert {
    public static toGroupsIndexResponse(json: any): GroupsIndexResponse[] {
        return cast(json, a(r("GroupsIndexResponse")));
    }

    public static groupsIndexResponseToJson(value: GroupsIndexResponse[]): any {
        return uncast(value, a(r("GroupsIndexResponse")));
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
    "GroupsIndexResponse": o([
        { json: "id", js: "id", typ: "" },
        { json: "group_id", js: "group_id", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "phone_number", js: "phone_number", typ: "" },
        { json: "type", js: "type", typ: r("Type") },
        { json: "description", js: "description", typ: "" },
        { json: "image_url", js: "image_url", typ: u(null, "") },
        { json: "creator_user_id", js: "creator_user_id", typ: "" },
        { json: "created_at", js: "created_at", typ: 0 },
        { json: "updated_at", js: "updated_at", typ: 0 },
        { json: "muted_until", js: "muted_until", typ: u(0, null) },
        { json: "office_mode", js: "office_mode", typ: true },
        { json: "share_url", js: "share_url", typ: "" },
        { json: "share_qr_code_url", js: "share_qr_code_url", typ: "" },
        { json: "members", js: "members", typ: a(r("Member")) },
        { json: "messages", js: "messages", typ: r("Messages") },
        { json: "max_members", js: "max_members", typ: 0 },
        { json: "theme_name", js: "theme_name", typ: u(null, "") },
        { json: "like_icon", js: "like_icon", typ: u(r("LikeIcon"), null) },
        { json: "requires_approval", js: "requires_approval", typ: true },
        { json: "show_join_question", js: "show_join_question", typ: true },
        { json: "join_question", js: "join_question", typ: null },
        { json: "message_deletion_period", js: "message_deletion_period", typ: 0 },
        { json: "message_deletion_mode", js: "message_deletion_mode", typ: a(r("MessageDeletionMode")) },
    ], false),
    "LikeIcon": o([
        { json: "type", js: "type", typ: "" },
        { json: "pack_id", js: "pack_id", typ: 0 },
        { json: "pack_index", js: "pack_index", typ: 0 },
    ], false),
    "Member": o([
        { json: "user_id", js: "user_id", typ: "" },
        { json: "nickname", js: "nickname", typ: "" },
        { json: "image_url", js: "image_url", typ: u(null, "") },
        { json: "id", js: "id", typ: "" },
        { json: "muted", js: "muted", typ: true },
        { json: "autokicked", js: "autokicked", typ: true },
        { json: "roles", js: "roles", typ: a(r("Role")) },
        { json: "name", js: "name", typ: "" },
    ], false),
    "Messages": o([
        { json: "count", js: "count", typ: 0 },
        { json: "last_message_id", js: "last_message_id", typ: "" },
        { json: "last_message_created_at", js: "last_message_created_at", typ: 0 },
        { json: "preview", js: "preview", typ: r("Preview") },
    ], false),
    "Preview": o([
        { json: "nickname", js: "nickname", typ: u(null, "") },
        { json: "text", js: "text", typ: u(null, "") },
        { json: "image_url", js: "image_url", typ: u(null, "") },
        { json: "attachments", js: "attachments", typ: a(r("Attachment")) },
        { json: "deleted_at", js: "deleted_at", typ: u(undefined, 0) },
        { json: "deletion_actor", js: "deletion_actor", typ: u(undefined, r("MessageDeletionMode")) },
    ], false),
    "Attachment": o([
        { json: "type", js: "type", typ: "" },
        { json: "url", js: "url", typ: u(undefined, "") },
        { json: "charmap", js: "charmap", typ: u(undefined, a(a(0))) },
        { json: "placeholder", js: "placeholder", typ: u(undefined, "") },
        { json: "loci", js: "loci", typ: u(undefined, a(a(0))) },
        { json: "user_ids", js: "user_ids", typ: u(undefined, a("")) },
    ], false),
    "Role": [
        "admin",
        "owner",
        "user",
    ],
    "MessageDeletionMode": [
        "creator",
        "sender",
    ],
    "Type": [
        "closed",
        "private",
    ],
};
