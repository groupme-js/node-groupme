import { Client } from "client/Client";
import { Attachment } from "./Attachment";

type MessagePreview = {
    id: string;
    user: UserPreview;
    createdAt: number;
    text: string;
    attachments: Attachment[];
}

type UserPreview = {
    nickname: string;
    image_url: string;
}

export abstract class Channel {
    readonly type: string;
    readonly id: string;
    readonly client: Client;
    messageCount: number;
    lastMessage: MessagePreview;
    createdAt: number;
    updatedAt: number;
    constructor(data: Channel) {
        this.type = data.type;
        this.id = data.id;
        this.client = data.client;
        this.messageCount = data.messageCount;
        this.lastMessage = data.lastMessage;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}

type dm = {
    created_at: number;
    updated_at: number;
    last_message: {
        attachments: Attachment[];
        avatar_url: string;
        conversation_id: string;
        created_at: number;
        favorited_by: never[];
        id: string;
        name: string;
        recipient_id: string;
        sender_id: string;
        sender_type: string;
        source_guid: string;
        text: string;
        user_id: string;
    };
    messages_count: number;
    other_user: {
        avatar_url: string;
        id: number;
        name: string;
    };
};
type group = {
    id: string;
    name: string;
    type: string;
    description: string;
    image_url: string;
    creator_user_id: string;
    created_at: number;
    updated_at: number;
    members: {
        user_id: string;
        nickname: string;
        muted: boolean;
        image_url: string;
    }[];
    share_url: string;
    messages: {
        count: number;
        last_message_id: string;
        last_message_created_at: number;
        preview: {
            nickname: string;
            text: string;
            image_url: string;
            attachments: Attachment[];
        };
    };
};