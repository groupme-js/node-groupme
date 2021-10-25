import { Client, Channel, User, Message, SendableChannelInterface } from "..";
import type { APIChat } from "../interfaces";
import ChatMessageManager from "../managers/ChatMessageManager";
import { ChannelType } from "./Channel";
import type ChatMessage from "./ChatMessage";

interface ChatInterface {
    send(message: Message): Promise<ChatMessage>

}

export default class Chat extends Channel implements ChatInterface, SendableChannelInterface {
    readonly type = ChannelType.Chat;
    readonly recipient: User;
    readonly messages: ChatMessageManager;
    readonly conversationID: string;
    constructor(client: Client, user: User, data: APIChat) {
        super({
            id: data.other_user.id,
            client: client,
            lastMessage: {
                id: data.last_message.id,
                attachments: data.last_message.attachments,
                createdAt: data.last_message.created_at,
                text: data.last_message.text,
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
        });
        this.conversationID = data.last_message.conversation_id;
        this.recipient = user;
        this.messages = new ChatMessageManager(client, this)
    }
    send(message: Message): Promise<ChatMessage> {
        throw new Error("Method not implemented.");
    }
}