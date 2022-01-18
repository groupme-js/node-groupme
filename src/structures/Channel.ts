import type { Client, Message } from "..";
import type MessageManager from "../managers/MessageManager";
import type Attachment from "./Attachment";

export enum ChannelType {
    Chat = "chat",
    Group = "group",
    FormerGroup = "former_group",
}

type MessagePreview = {
    id: string | null;
    user: UserPreview;
    createdAt: number | null;
    text: string | null;
    attachments: Attachment[];
};

type UserPreview = {
    nickname: string | null;
    image_url: string | null;
};

interface ChannelData {
    readonly id: string;
    readonly client: Client;
    messageCount: number;
    lastMessage: MessagePreview;
    createdAt: number;
    updatedAt: number;
    messageDeletionMode?: string[];
    messageDeletionPeriod?: number;
}

export default abstract class Channel implements ChannelData {
    abstract readonly type: ChannelType;
    readonly id: string;
    readonly client: Client;
    messageCount: number;
    lastMessage: MessagePreview;
    createdAt: number;
    updatedAt: number;
    messageDeletionMode?: string[];
    messageDeletionPeriod?: number;
    constructor(data: ChannelData) {
        this.id = data.id;
        this.client = data.client;
        this.messageCount = data.messageCount;
        this.lastMessage = data.lastMessage;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.messageDeletionMode = data.messageDeletionMode;
        this.messageDeletionPeriod = data.messageDeletionPeriod;
    }
}

export interface SendableChannelInterface {
    messages: MessageManager<Channel, Message>;
    send(text: string): Promise<Message>;
}
