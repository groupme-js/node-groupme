import type { APIUser } from 'groupme-api-types'
import type { Client } from '..'
import { BaseManager, User } from '..'

interface UserManagerInterface {}

export default class UserManager extends BaseManager<User, typeof User> implements UserManagerInterface {
    constructor(client: Client) {
        super(client, User)
    }

    _add(data: APIUser): User {
        return this._upsert(new User(this.client, data))
    }

    async fetch(id: string): Promise<User> {
        throw new Error('Method not implemented.')
    }
}
