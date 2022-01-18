import type {
    GetChatMessageResponse,
    GetChatMessagesQuery, GetChatMessagesResponse
} from "groupme-api-types";
import type { Chat, Client } from "..";
import { Collection } from "..";
import ChatMessage from "../structures/ChatMessage";
import MessageManager, { MessageRequestParams } from "./MessageManager";

export default class ChatMessageManager extends MessageManager<Chat, ChatMessage> {
    constructor(client: Client, channel: Chat) {
        super(client, channel, ChatMessage);
    }

    fetch(): Promise<Collection<string, ChatMessage>>;
    fetch(id: string): Promise<ChatMessage>;
    fetch(ids: string[]): Promise<Collection<string, ChatMessage>>;
    fetch(options: MessageRequestParams): Promise<Collection<string, ChatMessage>>;
    public async fetch(options?: string | string[] | MessageRequestParams): Promise<ChatMessage | Collection<string, ChatMessage>> {
        if (typeof options === 'string') {
            return await this.fetchId(options);
        } else if (Array.isArray(options)) {
            return await this.fetchIds(options);
        } else if (typeof options === 'object') {
            return await this.fetchIndex(options);
        } else {
            return await this.fetchAll();
        }
    }

    private async fetchId(id: string): Promise<ChatMessage> {
        const res = await this.client.rest.api<GetChatMessageResponse>(
            "GET",
            `direct_messages/${id}`,
            { query: { other_user_id: this.channel.recipient.id } }
        );
        const message = this._upsert(new ChatMessage(this.client, this.channel, res.message));
        return message;
    }

    private async fetchIds(ids: string[]): Promise<Collection<string, ChatMessage>> {
        const messages = await Promise.all(ids.map<Promise<ChatMessage>>(this.fetchId));
        const batch = new Collection<string, ChatMessage>(messages.map(m => [m.id, m]));
        return batch;
    }

    private async fetchIndex(options: MessageRequestParams): Promise<Collection<string, ChatMessage>> {
        const apiParams: GetChatMessagesQuery = { other_user_id: this.channel.recipient.id };
        if (options.before_id !== undefined) apiParams.before_id = options.before_id;
        if (options.after_id !== undefined) apiParams.after_id = options.after_id;
        if (options.since_id !== undefined) apiParams.since_id = options.since_id;
        if (options.limit !== undefined) apiParams.limit = options.limit;

        const batch = new Collection<string, ChatMessage>();
        const res = await this.client.rest.api<GetChatMessagesResponse>(
            "GET",
            `direct_messages`,
            { query: apiParams },
            { allowNull: true },
        );

        if (!res) return batch;

        for (const msgData of res.direct_messages) {
            const message = this._upsert(new ChatMessage(this.client, this.channel, msgData));
            batch.set(message.id, message);
        }

        batch.sort();
        return batch;
    }

    private async fetchAll(): Promise<Collection<string, ChatMessage>> {
        let batch = new Collection<string, ChatMessage>();
        let lastMessageID = (await this.fetchIndex({ limit: 1 })).last()?.id;
        if (!lastMessageID) return batch;

        do {
            batch = await this.fetchIndex({
                limit: 100,
                before_id: lastMessageID,
            });
            lastMessageID = batch.last()?.id
        } while (batch.size);

        this.cache.sort();
        return this.cache;
    }
}