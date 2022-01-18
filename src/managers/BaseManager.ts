import { Client, Collection } from "..";

interface Indexable {
    id: string
}

export default abstract class Manager<T extends Indexable> {
    readonly client: Client;
    readonly cache: Collection<string, T>;
    readonly holds: new (client: Client, ...args: any) => T;
    constructor(client: Client, holds: new (client: Client, ...args: any) => T) {
        this.client = client;
        this.holds = holds;
        this.cache = new Collection<string, T>();
    }
    resolve(data: any): T | null {
        if (data instanceof this.holds) return data;
        if (typeof data === 'string') return this.cache.get(data) ?? null;
        return null;
    }
    resolveId(data: any): string | null {
        return this.resolve(data)?.id ?? null;
    }
    _upsert(data: T): T {
        let obj = this.cache.get(data.id);
        if (obj) Object.assign(obj, data);
        else obj = data;
        this.cache.set(obj.id, obj);
        return obj;
    }
}

type IfEquals<X, Y, A, B> =
    (<T>() => T extends X ? 1 : 2) extends
    (<T>() => T extends Y ? 1 : 2) ? A : B;

type WritableKeysOf<T> = {
    [P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P, never>
}[keyof T];
type WritablePart<T> = Pick<T, WritableKeysOf<T>>;