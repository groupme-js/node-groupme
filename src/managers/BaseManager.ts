import { Client, Collection } from "..";

interface Indexable {
    id: string;
}

export default abstract class Manager<T extends Indexable> {
    private readonly _client: Client;
    public get client(): Client {
        return this._client;
    }
    readonly cache: Collection<string, T>;
    constructor(client: Client) {
        this._client = client;
        this.cache = new Collection<string, T>();
    }
    _upsert(data: T): T {
        let obj = this.cache.get(data.id);
        if (obj) Object.assign(obj, data);
        else obj = data;
        this.cache.set(obj.id, obj);
        return obj;
    }
}

type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends <
    T
>() => T extends Y ? 1 : 2
    ? A
    : B;

type WritableKeysOf<T> = {
    [P in keyof T]: IfEquals<
        { [Q in P]: T[P] },
        { -readonly [Q in P]: T[P] },
        P,
        never
    >;
}[keyof T];
type WritablePart<T> = Pick<T, WritableKeysOf<T>>;
