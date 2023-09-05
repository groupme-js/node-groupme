import type { Client } from '..'
import { BaseManager, User } from '..'
import type { UserData } from '../structures/User'

interface UserManagerInterface {}

export default class UserManager extends BaseManager<User, typeof User> implements UserManagerInterface {
    constructor(client: Client) {
        super(client, User)
    }

    _add(data: UserData): User {
        return this._upsert(new User(this.client, data))
    }

    async fetch(id: string): Promise<User> {
        throw new Error('Method not implemented.')
    }
}
