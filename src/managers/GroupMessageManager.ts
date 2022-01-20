import type {
    GetGroupMessageResponse,
    GetGroupMessagesQuery, GetGroupMessagesResponse
} from "groupme-api-types";
import type { Client, Group } from "..";
import { Collection, GroupMessage, MessageManager } from "..";
import type { MessageRequestParams } from "./MessageManager";

interface GroupMessageManagerInterface {
    client: Client
    channel: Group
    cache: Collection<string, GroupMessage>
    fetch(): Promise<Collection<string, GroupMessage>>
    fetch(id: string): Promise<GroupMessage>
    fetch(ids: string[]): Promise<Collection<string, GroupMessage>>
    fetch(options: MessageRequestParams): Promise<Collection<string, GroupMessage>>
}

export default class GroupMessageManager extends MessageManager<Group, GroupMessage> implements GroupMessageManagerInterface {
    constructor(client: Client, channel: Group) {
        super(client, channel, GroupMessage);
    }

    fetch(): Promise<Collection<string, GroupMessage>>;
    fetch(id: string): Promise<GroupMessage>;
    fetch(ids: string[]): Promise<Collection<string, GroupMessage>>;
    fetch(options: MessageRequestParams): Promise<Collection<string, GroupMessage>>;
    public async fetch(options?: string | string[] | MessageRequestParams): Promise<GroupMessage | Collection<string, GroupMessage>> {
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

    private async fetchId(id: string): Promise<GroupMessage> {
        const res = await this.client.rest.api<GetGroupMessageResponse>(
            "GET",
            `groups/${this.channel.id}/messages/${id}`
        );
        const message = this._upsert(new GroupMessage(this.client, this.channel, res.message));
        return message;
    }

    private async fetchIds(ids: string[]): Promise<Collection<string, GroupMessage>> {
        const messages = await Promise.all(ids.map<Promise<GroupMessage>>(this.fetchId));
        const batch = new Collection<string, GroupMessage>(messages.map(m => [m.id, m]));
        return batch;
    }

    private async fetchIndex(options: MessageRequestParams): Promise<Collection<string, GroupMessage>> {
        const apiParams: GetGroupMessagesQuery = {};
        if (options.before_id !== undefined) apiParams.before_id = options.before_id;
        if (options.after_id !== undefined) apiParams.after_id = options.after_id;
        if (options.since_id !== undefined) apiParams.since_id = options.since_id;
        if (options.limit !== undefined) apiParams.limit = options.limit;

        const batch = new Collection<string, GroupMessage>();
        const res = await this.client.rest.api<GetGroupMessagesResponse>(
            "GET",
            `groups/${this.channel.id}/messages`,
            { query: apiParams },
            { allowNull: true },
        );

        if (!res) return batch;

        for (const msgData of res.messages) {
            const message = this._upsert(new GroupMessage(this.client, this.channel, msgData));
            batch.set(message.id, message);
        }

        batch.sort();
        return batch;
    }

    private async fetchAll(): Promise<Collection<string, GroupMessage>> {
        let batch = new Collection<string, GroupMessage>();
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