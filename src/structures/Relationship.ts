import type { APIRelationship } from 'groupme-api-types/v4'
import type { Client, User } from '..'
import { Base } from '..'

export default class Relationship extends Base {
    user: User
    reason: number
    hidden: boolean
    appInstalled: boolean
    mri: string
    createdAt: number
    updatedAt: number
    _iso8601: string
    constructor(client: Client, data: APIRelationship) {
        super(client, data.user_id)
        this.user = client.users._add({
            id: data.user_id,
            name: data.name,
            avatar_url: data.avatar_url,
        })
        this.reason = data.reason
        this.hidden = data.hidden
        this.appInstalled = data.app_installed
        this.mri = data.mri
        this.createdAt = data.created_at
        this.updatedAt = data.updated_at
        this._iso8601 = data.updated_at_iso8601
    }
    _patch(data: Partial<APIRelationship>): this {
        this.user._patch({
            name: data.name,
            avatar_url: data.avatar_url,
        })

        if (data.app_installed !== undefined) this.appInstalled = data.app_installed
        if (data.created_at !== undefined) this.createdAt = data.created_at
        if (data.hidden !== undefined) this.hidden = data.hidden
        if (data.mri !== undefined) this.mri = data.mri
        if (data.reason !== undefined) this.reason = data.reason
        if (data.updated_at !== undefined) this.updatedAt = data.updated_at
        if (data.updated_at_iso8601) this._iso8601 = data.updated_at_iso8601

        return this
    }
}
