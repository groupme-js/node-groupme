import fetch, { Headers, RequestInit, Response } from 'node-fetch'
import { URL } from 'url'
import { inspect } from 'util'
import type { Client } from '..'

function assertDefined<T>(val: T, err: Error): asserts val is NonNullable<T> {
    if (val === undefined || val === null) throw err
}

function createAPIError(message: string, endpoint: URL, options: unknown, response: unknown): Error {
    return new Error(
        `${message}\n-- Endpoint: ${endpoint}\n-- Options: ${inspect(options)}\n-- Response: ${inspect(response)}`,
    )
}

function* i() {
    let i = 1
    while (true) {
        i = (i + 1) % 10000000
        yield i
    }
}

type HttpMethod = 'GET' | 'POST'

type RequestOptions = {
    query?: Record<string, unknown>
    body?: unknown
}

export default class RESTManager {
    static URLS = {
        v4: 'https://api.groupme.com/v4/',
        v3: 'https://api.groupme.com/v3/',
        v2: 'https://v2.groupme.com/',
    }
    public client: Client
    private generator: Generator<number, void, unknown>
    constructor(client: Client) {
        this.client = client
        this.generator = i()
    }

    async api<T>(
        method: HttpMethod,
        path: string,
        data?: RequestOptions,
        options?: { version: keyof typeof RESTManager.URLS },
    ): Promise<T>
    async api(
        method: HttpMethod,
        path: string,
        data: RequestOptions,
        options: { skipJsonParse: true },
    ): Promise<Response>
    async api<T>(
        method: HttpMethod,
        path: string,
        data: RequestOptions,
        options: { allowNull: true },
    ): Promise<T | null>
    async api<T>(
        method: HttpMethod,
        path: string,
        data: RequestOptions = {},
        {
            skipJsonParse = false,
            allowNull = false,
            version = 'v3',
        }: {
            skipJsonParse?: boolean
            allowNull?: boolean
            version?: keyof typeof RESTManager.URLS
        } = {},
    ): Promise<T | Response | null> {
        const url = new URL(path, RESTManager.URLS[version])
        if (data?.query) {
            for (const key in data.query) {
                if (Object.prototype.hasOwnProperty.call(data.query, key)) {
                    const value = data.query[key]
                    url.searchParams.set(key, String(value))
                }
            }
        }

        const init: RequestInit = {}
        init.headers = new Headers()
        init.headers.set('X-Access-Token', this.client.token)
        init.method = method
        if (data?.body) {
            init.headers.set('Content-Type', 'application/json')
            init.body = JSON.stringify(data.body)
        }

        const response = await fetch(url, init)
        console.log(`-----\nAPI request\nurl: ${url}\n-----`)

        if (skipJsonParse) return response
        // for (const header of response.headers.entries()) // console.log(header)
        if (response.headers.get('content-length') === '0') {
            if (allowNull) return null
            else throw createAPIError('Received a response with Content-Length: 0, but expected content', url, data, {})
        }

        const json = await response.json()
        assertDefined(json, createAPIError('Invalid API response', url, data, json))
        assertDefined(json.meta, createAPIError('Response is missing "meta" field', url, data, json))
        if (json.meta.errors) throw createAPIError(json.meta.errors.join('; '), url, data, json)

        const result: T = json.response as T

        return result
    }

    guid(): string {
        return `node-groupme_${this.generator.next().value}_${Math.floor(Math.random() * 16 ** 6)
            .toString(16)
            .padEnd(6, '0')}`
    }
}
