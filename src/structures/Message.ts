import type { APIChatMessage, APIGroupMessage, DeleteGroupMessageResponse } from 'groupme-api-types'
import type { Attachment, Channel, Client } from '..'
import { User } from '..'

interface MessageInterface {
    fetch(): Promise<this>
    reply(message: string): Promise<Message>
    like(): Promise<this>
    unlike(): Promise<this>
    delete(): Promise<void>
    get canDelete(): boolean
}

export default abstract class Message implements MessageInterface {
    id: string
    user: User
    channel: Channel
    text: string | null
    createdAt: number
    sourceGuid: string
    system: boolean
    likes: (User | string)[]
    attachments: Attachment[]
    constructor(client: Client, channel: Channel, data: APIGroupMessage | APIChatMessage) {
        this.id = data.id
        this.user = client.users._upsert(
            new User(client, {
                id: data.user_id,
                avatar: data.avatar_url,
                name: data.name,
            }),
        )
        this.channel = channel
        this.text = data.text
        this.createdAt = data.created_at
        this.sourceGuid = data.source_guid
        this.system = 'system' in data ? data.system : false
        this.likes = data.favorited_by.map(id => client.users.cache.get(id) || id)
        this.attachments = data.attachments
    }
    fetch(): Promise<this> {
        throw new Error('Method not implemented.')
    }
    reply(message: string): Promise<Message> {
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
