import type { APIUser } from 'groupme-api-types'
import type { Client } from '..'
import { Base } from '..'

interface UserInterface {}

export default class User extends Base implements UserInterface {
    avatar?: string | null
    name: string
    constructor(client: Client, data: APIUser) {
        super(client, String(data.id))
        this.avatar = data.avatar_url
        this.name = data.name
    }
    _patch(data: Partial<APIUser>): this {
        if (data.avatar_url !== undefined) this.avatar = data.avatar_url
        if (data.name !== undefined) this.name = data.name

        return this
    }
}
