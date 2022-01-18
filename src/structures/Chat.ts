import type {
    APIChat,
    PostChatMessageBody,
    PostChatMessageResponse,
} from "groupme-api-types";
import { Channel, Client, Message, SendableChannelInterface, User } from "..";
import ChatMessageManager from "../managers/ChatMessageManager";
import { ChannelType } from "./Channel";
import ChatMessage from "./ChatMessage";

interface ChatInterface {
    send(text: string): Promise<ChatMessage>;
}

export default class Chat
    extends Channel
    implements ChatInterface, SendableChannelInterface
{
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
        this.messages = new ChatMessageManager(client, this);
    }
    public async send(text: string): Promise<ChatMessage> {
        const body: PostChatMessageBody = {
            direct_message: {
                text,
                attachments: [],
                source_guid: this.client.rest.guid(),
                recipient_id: this.recipient.id,
            },
        };
        const response = await this.client.rest.api<PostChatMessageResponse>(
            "POST",
            "direct_messages",
            { body }
        );
        const message = new ChatMessage(
            this.client,
            this,
            response.direct_message
        );
        return this.messages._upsert(message);
    }
}
