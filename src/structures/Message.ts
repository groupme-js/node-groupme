import type { APIChatMessage, APIGroupMessage, DeleteGroupMessageResponse } from 'groupme-api-types'
import type { Attachment, Channel, Client, Base, User } from '..'

interface MessageInterface<T extends Channel> {
    fetch(): Promise<this>
    reply(message: string): Promise<Message<T>>
    like(): Promise<this>
    unlike(): Promise<this>
    delete(): Promise<void>
    get canDelete(): boolean
}

export default abstract class Message<T extends Channel> extends Base implements MessageInterface<T> {
    user: User
    channel: T
    text: string | null
    createdAt: number
    sourceGuid: string
    system: boolean
    likes: (User | string)[]
    attachments: Attachment[]
    constructor(client: Client, channel: T, data: APIGroupMessage | APIChatMessage) {
        super(client, data.id)
        this.user = client.users._add({
            id: data.user_id,
            avatar_url: data.avatar_url,
            name: data.name,
        })
        this.channel = channel
        this.text = data.text
        this.createdAt = data.created_at
        this.sourceGuid = data.source_guid
        this.attachments = data.attachments
        this.likes = data.favorited_by?.map(id => client.users.cache.get(id) || id)
        this.system = 'system' in data ? data.system : false
    }

    _patch(data: Partial<APIGroupMessage | APIChatMessage>): this {
        this.user._patch({
            name: data.name,
            avatar_url: data.avatar_url,
        })

        if (data.text !== undefined) this.text = data.text
        if (data.created_at !== undefined) this.createdAt = data.created_at
        if (data.source_guid !== undefined) this.sourceGuid = data.source_guid
        if (data.attachments !== undefined) this.attachments = data.attachments
        if (data.favorited_by !== undefined)
            this.likes = data.favorited_by.map(id => this.client.users.cache.get(id) || id)
        if ('system' in data && data.system !== undefined) this.system = data.system

        return this
    }

    // some or all of these methods may have to be abstracted here and implemented in child classes
    fetch(): Promise<this> {
        throw new Error('Method not implemented.')
    }
    reply(message: string): Promise<Message<T>> {
        throw new Error('Method not implemented.')
    }
    like(): Promise<this> {
        throw new Error('Method not implemented.')
    }
    unlike(): Promise<this> {
        throw new Error('Method not implemented.')
    }
    async delete(): Promise<void> {
        await this.user.client.rest.api<DeleteGroupMessageResponse>(
            'DELETE',
            `conversations/${this.channel.id}/messages/${this.id}`,
        )
    }
    get canDelete(): boolean {
        throw new Error('Method not implemented.')
    }
}
