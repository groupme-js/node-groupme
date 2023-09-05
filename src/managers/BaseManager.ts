import type { Client } from '..'
import { Collection } from '..'

interface Indexable {
    id: string
}

export default abstract class BaseManager<T extends Indexable> {
    readonly client: Client
    readonly cache: Collection<string, T>
    readonly holds: new (client: Client, ...args: any[]) => T
    constructor(client: Client, holds: new (client: Client, ...args: any[]) => T) {
        this.client = client
        this.holds = holds
        this.cache = new Collection<string, T>()
    }
    abstract fetch(id: string): Promise<T>
    resolve(data: unknown): T | null {
        if (data instanceof this.holds) return data
        if (typeof data === 'string') return this.cache.get(data) ?? null
        return null
    }
    resolveId(data: unknown): string | null {
        return this.resolve(data)?.id ?? null
    }
    _upsert(data: T): T {
        let obj = this.cache.get(data.id)
        if (obj) Object.assign(obj, data)
        else obj = data
        this.cache.set(obj.id, obj)
        return obj
    }
}
