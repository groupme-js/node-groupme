import fetch, { Headers, RequestInit } from "node-fetch";
import { URL } from "url";
import { inspect } from "util";
import type { Client } from "..";

function assertDefined<T>(val: T, err: Error): asserts val is NonNullable<T> {
    if (val === undefined || val === null) throw err;
}

function createAPIError(message: string, endpoint: URL, options: any, response: any): Error {
    return new Error(`${message}\n-- Endpoint: ${endpoint}\n-- Options: ${inspect(options)}\n-- Response: ${inspect(response)}`);
}

export default class RESTManager {
    static BASE_URL = "https://api.groupme.com/v3/"
    client: Client;
    constructor(client: Client) {
        this.client = client;
    }

    async api<T>(method: "GET" | "POST", path: string, transformer: (json: any) => T, options?: { query?: { [key: string]: any }, body?: any }): Promise<T> {
        const url = new URL(path, RESTManager.BASE_URL);
        if (options && options.query) {
            for (const key in options.query) {
                if (Object.prototype.hasOwnProperty.call(options.query, key)) {
                    const value = options.query[key];
                    url.searchParams.set(key, value);
                }
            }
        }

        const init: RequestInit = {};
        init.headers = new Headers();
        init.headers.set('X-Access-Token', this.client.token);
        init.method = method;
        if (options && options.body) init.body = options.body;

        const response = await fetch(url, init);
        console.log(`-----\nAPI request\nurl: ${url}\n-----`)
        const data = await response.json();
        assertDefined<any>(data, createAPIError('Invalid API response', url, options, data))
        assertDefined<any>(data.meta, createAPIError('Response is missing "meta" field', url, options, data))
        if (data.meta.errors) throw createAPIError(data.meta.errors.join('; '), url, options, data);

        const result: T = transformer(data.response);

        return result;
    }

}

// type GroupsIndexResponse = {
//     id: string,
//     group_id: string,
//     name: string,
//     phone_number: string,
//     type: string,
//     description: string,
//     image_url: string,
//     creator_user_id: string,
//     created_at: number,
//     updated_at: number,
//     muted_until: number,
//     office_mode: boolean,
//     share_url: string,
//     share_qr_code_url: string,
//     members: {
//         user_id: string,
//         nickname: string,
//         image_url: string,
//         id: string,
//         muted: boolean,
//         autokicked: boolean,
//         roles: ["admin", "owner"] | ["admin"] | ["user"],
//         name: string,
//     }[] | null,
//     messages: {
//         count: number,
//         last_message_id: string,
//         last_message_created_at: number,
//         preview: {
//             nickname: string,
//             text: string,
//             image_url: string,
//             attachments: Attachment[],
//         }
//     },
//     max_members: number,
//     theme_name: string | null,
//     like_icon: {
//         type: "emoji",
//         packId: number,
//         packIndex: number
//     } | null;
//     message_deletion_period: number,
//     message_deletion_mode: string[],
//     requires_approval: boolean,
//     show_join_question: boolean,
//     join_question: null // just pretend that this will never exist :clueless:
// }[];

// type ChatsIndexResponse = {
//     created_at: number,
//     updated_at: number,
//     messages_count: number,
//     message_deletion_period: number,
//     message_deletion_mode: string[],
//     last_message: {
//         attachments: Attachment[],
//         avatar_url: string,
//         conversation_id: string,
//         created_at: number,
//         favorited_by: [], // This seems to always be empty
//         id: string,
//         name: string,
//         recipient_id: string,
//         sender_id: string,
//         sender_type: string,
//         source_guid: string,
//         text: string,
//         user_id: string,
//     },
//     other_user: {
//         avatar_url: string,
//         id: string,
//         name: string,
//     },
// }[];
