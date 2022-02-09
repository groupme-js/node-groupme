import type { APIRelationship } from 'groupme-api-types/v4'
import type { Client } from '..'
import { User } from '..'

export default class Relationship {
    client: Client
    user: User
    id: string
    reason: number
    hidden: boolean
    appInstalled: boolean
    mri: string
    createdAt: number
    updatedAt: number
    _iso8601: string
    constructor(client: Client, data: APIRelationship) {
        this.client = client
        this.user = client.users._upsert(
            new User(client, {
                id: data.user_id,
                name: data.name,
                avatar: data.avatar_url,
            }),
        )
        this.id = data.id
        this.reason = data.reason
        this.hidden = data.hidden
        this.appInstalled = data.app_installed
        this.mri = data.mri
        this.createdAt = data.created_at
        this.updatedAt = data.updated_at
        this._iso8601 = data.updated_at_iso8601
    }
}
