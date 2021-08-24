// To parse this data:
//
//   import { Convert, GroupResponse, MemberResponse, Role, MessagesResponse, Preview, GroupType, MessageDeletionMode, LikeIcon, Attachment } from "./file";
//
//   const groupResponse = Convert.toGroupResponse(json);
//   const memberResponse = Convert.toMemberResponse(json);
//   const role = Convert.toRole(json);
//   const messagesResponse = Convert.toMessagesResponse(json);
//   const preview = Convert.toPreview(json);
//   const groupType = Convert.toGroupType(json);
//   const messageDeletionMode = Convert.toMessageDeletionMode(json);
//   const likeIcon = Convert.toLikeIcon(json);
//   const attachment = Convert.toAttachment(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface GroupResponse {
    created_at:               number;
    creator_user_id:          string;
    description:              string;
    group_id:                 string;
    id:                       string;
    image_url:                null | string;
    join_question:            null;
    like_icon:                null | LikeIcon;
    max_members:              number;
    max_memberships?:         number;
    members:                  MemberResponse[];
    message_deletion_mode?:   MessageDeletionMode[];
    message_deletion_period?: number;
    messages:                 MessagesResponse;
    muted_until?:             number | null;
    name:                     string;
    office_mode:              boolean;
    phone_number:             null | string;
    requires_approval:        boolean;
    share_qr_code_url:        null | string;
    share_url:                null | string;
    show_join_question:       boolean;
    theme_name:               null | string;
    thread_id?:               null;
    type:                     GroupType;
    updated_at:               number;
}

interface LikeIcon {
    pack_id:    number;
    pack_index: number;
    type:       string;
}

interface MemberResponse {
    autokicked: boolean;
    id:         string;
    image_url:  null | string;
    muted:      boolean;
    name:       string;
    nickname:   string;
    roles:      Role[];
    user_id:    string;
}

enum Role {
    Admin = "admin",
    Owner = "owner",
    User = "user",
}

enum MessageDeletionMode {
    Creator = "creator",
    Sender = "sender",
}

interface MessagesResponse {
    count:                   number;
    last_message_created_at: number | null;
    last_message_id:         null | string;
    preview:                 Preview;
}

interface Preview {
    attachments:     Attachment[];
    deleted_at?:     number;
    deletion_actor?: MessageDeletionMode;
    image_url:       null | string;
    nickname:        null | string;
    text:            null | string;
}

interface Attachment {
    charmap?:     Array<number[]>;
    loci?:        Array<number[]>;
    placeholder?: string;
    type:         string;
    url?:         string;
    user_ids?:    string[];
}

enum GroupType {
    Closed = "closed",
    Private = "private",
}

// Converts JSON types to/from your types
// and asserts the results at runtime
export class Convert {
    public static toGroupResponse(json: any): GroupResponse {
        return cast(json, r("GroupResponse"));
    }

    public static groupResponseToJson(value: GroupResponse): any {
        return uncast(value, r("GroupResponse"));
    }

    public static toMemberResponse(json: any): MemberResponse {
        return cast(json, r("MemberResponse"));
    }

    public static memberResponseToJson(value: MemberResponse): any {
        return uncast(value, r("MemberResponse"));
    }

    public static toRole(json: any): Role {
        return cast(json, r("Role"));
    }

    public static roleToJson(value: Role): any {
        return uncast(value, r("Role"));
    }

    public static toMessagesResponse(json: any): MessagesResponse {
        return cast(json, r("MessagesResponse"));
    }

    public static messagesResponseToJson(value: MessagesResponse): any {
        return uncast(value, r("MessagesResponse"));
    }

    public static toPreview(json: any): Preview {
        return cast(json, r("Preview"));
    }

    public static previewToJson(value: Preview): any {
        return uncast(value, r("Preview"));
    }

    public static toGroupType(json: any): GroupType {
        return cast(json, r("GroupType"));
    }

    public static groupTypeToJson(value: GroupType): any {
        return uncast(value, r("GroupType"));
    }

    public static toMessageDeletionMode(json: any): MessageDeletionMode {
        return cast(json, r("MessageDeletionMode"));
    }

    public static messageDeletionModeToJson(value: MessageDeletionMode): any {
        return uncast(value, r("MessageDeletionMode"));
    }

    public static toLikeIcon(json: any): LikeIcon {
        return cast(json, r("LikeIcon"));
    }

    public static likeIconToJson(value: LikeIcon): any {
        return uncast(value, r("LikeIcon"));
    }

    public static toAttachment(json: any): Attachment {
        return cast(json, r("Attachment"));
    }

    public static attachmentToJson(value: Attachment): any {
        return uncast(value, r("Attachment"));
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
    "GroupResponse": o([
        { json: "created_at", js: "created_at", typ: 3.14 },
        { json: "creator_user_id", js: "creator_user_id", typ: "" },
        { json: "description", js: "description", typ: "" },
        { json: "group_id", js: "group_id", typ: "" },
        { json: "id", js: "id", typ: "" },
        { json: "image_url", js: "image_url", typ: u(null, "") },
        { json: "join_question", js: "join_question", typ: null },
        { json: "like_icon", js: "like_icon", typ: u(null, r("LikeIcon")) },
        { json: "max_members", js: "max_members", typ: 3.14 },
        { json: "max_memberships", js: "max_memberships", typ: u(undefined, 3.14) },
        { json: "members", js: "members", typ: a(r("MemberResponse")) },
        { json: "message_deletion_mode", js: "message_deletion_mode", typ: u(undefined, a(r("MessageDeletionMode"))) },
        { json: "message_deletion_period", js: "message_deletion_period", typ: u(undefined, 3.14) },
        { json: "messages", js: "messages", typ: r("MessagesResponse") },
        { json: "muted_until", js: "muted_until", typ: u(undefined, u(3.14, null)) },
        { json: "name", js: "name", typ: "" },
        { json: "office_mode", js: "office_mode", typ: true },
        { json: "phone_number", js: "phone_number", typ: u(null, "") },
        { json: "requires_approval", js: "requires_approval", typ: true },
        { json: "share_qr_code_url", js: "share_qr_code_url", typ: u(null, "") },
        { json: "share_url", js: "share_url", typ: u(null, "") },
        { json: "show_join_question", js: "show_join_question", typ: true },
        { json: "theme_name", js: "theme_name", typ: u(null, "") },
        { json: "thread_id", js: "thread_id", typ: u(undefined, null) },
        { json: "type", js: "type", typ: r("GroupType") },
        { json: "updated_at", js: "updated_at", typ: 3.14 },
    ], "any"),
    "LikeIcon": o([
        { json: "pack_id", js: "pack_id", typ: 3.14 },
        { json: "pack_index", js: "pack_index", typ: 3.14 },
        { json: "type", js: "type", typ: "" },
    ], "any"),
    "MemberResponse": o([
        { json: "autokicked", js: "autokicked", typ: true },
        { json: "id", js: "id", typ: "" },
        { json: "image_url", js: "image_url", typ: u(null, "") },
        { json: "muted", js: "muted", typ: true },
        { json: "name", js: "name", typ: "" },
        { json: "nickname", js: "nickname", typ: "" },
        { json: "roles", js: "roles", typ: a(r("Role")) },
        { json: "user_id", js: "user_id", typ: "" },
    ], "any"),
    "MessagesResponse": o([
        { json: "count", js: "count", typ: 3.14 },
        { json: "last_message_created_at", js: "last_message_created_at", typ: u(3.14, null) },
        { json: "last_message_id", js: "last_message_id", typ: u(null, "") },
        { json: "preview", js: "preview", typ: r("Preview") },
    ], "any"),
    "Preview": o([
        { json: "attachments", js: "attachments", typ: a(r("Attachment")) },
        { json: "deleted_at", js: "deleted_at", typ: u(undefined, 3.14) },
        { json: "deletion_actor", js: "deletion_actor", typ: u(undefined, r("MessageDeletionMode")) },
        { json: "image_url", js: "image_url", typ: u(null, "") },
        { json: "nickname", js: "nickname", typ: u(null, "") },
        { json: "text", js: "text", typ: u(null, "") },
    ], "any"),
    "Attachment": o([
        { json: "charmap", js: "charmap", typ: u(undefined, a(a(3.14))) },
        { json: "loci", js: "loci", typ: u(undefined, a(a(3.14))) },
        { json: "placeholder", js: "placeholder", typ: u(undefined, "") },
        { json: "type", js: "type", typ: "" },
        { json: "url", js: "url", typ: u(undefined, "") },
        { json: "user_ids", js: "user_ids", typ: u(undefined, a("")) },
    ], "any"),
    "Role": [
        "admin",
        "owner",
        "user",
    ],
    "MessageDeletionMode": [
        "creator",
        "sender",
    ],
    "GroupType": [
        "closed",
        "private",
    ],
};
