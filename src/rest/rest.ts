import fetch, { Headers, RequestInit, Response } from "node-fetch";
import { URL } from "url";
import { inspect } from "util";
import type { Client } from "..";

function assertDefined<T>(val: T, err: Error): asserts val is NonNullable<T> {
    if (val === undefined || val === null) throw err;
}

function createAPIError(message: string, endpoint: URL, options: any, response: any): Error {
    return new Error(`${message}\n-- Endpoint: ${endpoint}\n-- Options: ${inspect(options)}\n-- Response: ${inspect(response)}`);
}

type HttpMethod = "GET" | "POST";

type RequestOptions = {
    query?: {
        [key: string]: any;
    };
    body?: any;
};

export default class RESTManager {
    static BASE_URL = "https://api.groupme.com/v3/"
    client: Client;
    constructor(client: Client) {
        this.client = client;
    }

    async api<T>(method: HttpMethod, path: string, data?: RequestOptions): Promise<T>;
    async api<T>(method: HttpMethod, path: string, data: RequestOptions, options: { skipJsonParse: true }): Promise<Response>;
    async api<T>(method: HttpMethod, path: string, data: RequestOptions, options: { allowNull: true }): Promise<T | null>;
    async api<T>(method: HttpMethod, path: string, data?: RequestOptions, options?: { skipJsonParse?: boolean, allowNull?: boolean }): Promise<T | Response | null> {
        const url = new URL(path, RESTManager.BASE_URL);
        if (data?.query) {
            for (const key in data.query) {
                if (Object.prototype.hasOwnProperty.call(data.query, key)) {
                    const value = data.query[key];
                    url.searchParams.set(key, value);
                }
            }
        }

        const init: RequestInit = {};
        init.headers = new Headers();
        init.headers.set('X-Access-Token', this.client.token);
        init.method = method;
        if (data?.body) init.body = data.body;

        const response = await fetch(url, init);
        console.log(`-----\nAPI request\nurl: ${url}\n-----`)

        if (options?.skipJsonParse) return response;
        // for (const header of response.headers.entries()) console.log(header)
        if (response.headers.get('content-length') === '0') {
            if (options?.allowNull) return null;
            else throw createAPIError('Received a response with Content-Length: 0, but expected content', url, data, {});
        }

        const json = await response.json();
        assertDefined<any>(json, createAPIError('Invalid API response', url, data, json));
        assertDefined<any>(json.meta, createAPIError('Response is missing "meta" field', url, data, json));
        if (json.meta.errors) throw createAPIError(json.meta.errors.join('; '), url, data, json);

        const result: T = json.response as T;

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
