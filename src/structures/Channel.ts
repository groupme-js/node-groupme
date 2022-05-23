import type { APIChat, APIGroup } from 'groupme-api-types'
import type { Attachment, Client, Message, MessageManager } from '..'
import { Base } from '..'

export enum ChannelType {
    Chat = 'chat',
    Group = 'group',
    FormerGroup = 'former_group',
}

type MessagePreview = {
    id: string | null
    user: UserPreview
    createdAt: number | null
    text: string | null
    attachments: Attachment[]
}

type UserPreview = {
    nickname: string | null
    image_url: string | null
}

interface ChannelData {
    readonly id: string
    messageCount: number
    lastMessage: MessagePreview
    createdAt: number
    updatedAt: number
    messageDeletionMode?: string[]
    messageDeletionPeriod?: number
}

export default abstract class Channel extends Base implements ChannelData {
    abstract readonly type: ChannelType
    messageCount: number
    lastMessage: MessagePreview
    createdAt: number
    updatedAt: number
    messageDeletionMode?: string[]
    messageDeletionPeriod?: number
    constructor(client: Client, data: ChannelData) {
        super(client, data.id)
        this.messageCount = data.messageCount
        this.lastMessage = data.lastMessage
        this.createdAt = data.createdAt
        this.updatedAt = data.updatedAt
        this.messageDeletionMode = data.messageDeletionMode
        this.messageDeletionPeriod = data.messageDeletionPeriod
    }

    static _patch(self: Channel, data: Partial<ChannelData>): typeof self {
        if (data.messageCount !== undefined) self.messageCount = data.messageCount
        if (data.lastMessage !== undefined) self.lastMessage = data.lastMessage
        if (data.createdAt !== undefined) self.createdAt = data.createdAt
        if (data.updatedAt !== undefined) self.updatedAt = data.updatedAt
        if (data.messageDeletionMode !== undefined) self.messageDeletionMode = data.messageDeletionMode
        if (data.messageDeletionPeriod !== undefined) self.messageDeletionPeriod = data.messageDeletionPeriod

        return self
    }

    static dataFromGroup(data: APIGroup): ChannelData {
        return {
            id: data.id,
            lastMessage: {
                id: data.messages.last_message_id,
                createdAt: data.messages.last_message_created_at,
                text: data.messages.preview.text,
                attachments: data.messages.preview.attachments,
                user: {
                    image_url: data.messages.preview.image_url,
                    nickname: data.messages.preview.nickname,
                },
            },
            messageCount: data.messages.count,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            messageDeletionMode: data.message_deletion_mode,
            messageDeletionPeriod: data.message_deletion_period,
        }
    }

    static dataFromChat(data: APIChat): ChannelData {
        return {
            id: data.other_user.id,
            lastMessage: {
                id: data.last_message.id,
                createdAt: data.last_message.created_at,
                text: data.last_message.text,
                attachments: data.last_message.attachments,
                user: {
                    nickname: data.last_message.name,
                    image_url: data.last_message.avatar_url,
                },
            },
            messageCount: data.messages_count,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            messageDeletionMode: data.message_deletion_mode,
            messageDeletionPeriod: data.message_deletion_period,
        }
    }
}

export interface SendableChannelInterface {
    messages: MessageManager<Channel, Message>
    send(text: string): Promise<Message>
}
