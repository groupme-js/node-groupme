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

function* i() {
    let i = 1;
    while (true)
        yield i++ % 10000000;
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
    public client: Client;
    private generator: Generator<number, void, unknown>;
    constructor(client: Client) {
        this.client = client;
        this.generator = i();
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

    guid(): string {
        return 'node-groupme_' + this.generator.next().value;
    }

}
