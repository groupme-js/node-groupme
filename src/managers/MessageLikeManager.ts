import { UserManager } from '..'
import type { Client, User } from '..'

interface MessageLikeManagerInterface {
    get ids(): string[]
    get mine(): boolean
    fetchUsers(): Promise<User[]>
}

export default class MessageLikeManager extends UserManager implements MessageLikeManagerInterface {
    private readonly idSet: Set<string>
    constructor(client: Client, ids: string[]) {
        super(client)
        this.idSet = new Set<string>(ids)
    }

    _addID(id: string): this {
        this.idSet.add(id)
        const user = this.client.users.cache.get(id)
        if (user) {
            this.cache.set(id, user)
        }
        return this
    }

    _deleteID(id: string): this {
        this.idSet.delete(id)
        this.cache.delete(id)
        return this
    }

    public get ids(): string[] {
        const idArray: string[] = []
        this.idSet.forEach(id => idArray.push(id))
        return idArray
    }

    public get mine(): boolean {
        return this.idSet.has(this.client.user.id)
    }

    public async fetchUsers(): Promise<User[]> {
        const userPromises: Promise<User>[] = []
        // for each id: push a promise<user> of fetching the user, and upserting into this.cache
        this.idSet.forEach(id => userPromises.push(this.client.users.fetch(id).then(user => this._upsert(user))))
        const users = Promise.all(userPromises)
        return users
    }
}
