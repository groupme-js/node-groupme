import type { APIChat, PostChatMessageBody, PostChatMessageResponse } from 'groupme-api-types'
import type { Client, SendableChannelInterface, User } from '..'
import { Channel, ChannelType, ChatMessage, ChatMessageManager } from '..'

interface ChatInterface {
    send(text: string): Promise<ChatMessage>
}

export default class Chat extends Channel implements ChatInterface, SendableChannelInterface {
    readonly type = ChannelType.Chat
    readonly recipient: User
    readonly messages: ChatMessageManager
    readonly conversationID: string
    constructor(client: Client, user: User, data: APIChat) {
        super(client, Channel.dataFromChat(data))
        this.conversationID = data.last_message.conversation_id
        this.recipient = user
        this.messages = new ChatMessageManager(client, this)
    }
    public async send(text: string): Promise<ChatMessage> {
        const body: PostChatMessageBody = {
            direct_message: {
                text,
                attachments: [],
                source_guid: this.client.rest.guid(),
                recipient_id: this.recipient.id,
            },
        }
        const response = await this.client.rest.api<PostChatMessageResponse>('POST', 'direct_messages', { body })
        const message = new ChatMessage(this.client, this, response.direct_message)
        return this.messages._upsert(message)
    }
}
