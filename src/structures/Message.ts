import type { APIGroupMessage, APIChatMessage } from "groupme-api-types";
import type { Channel, Client } from "..";
import { User } from "..";
import type Attachment from "./Attachment";

interface MessageInterface {
    fetch(): Promise<this>
    reply(message: string): Promise<Message>
    like(): Promise<this>
    unlike(): Promise<this>
    delete(): Promise<this>
    get canDelete(): boolean
}

export default abstract class Message implements MessageInterface {
    id: string;
    user: User;
    channel: Channel;
    text: string | null;
    createdAt: number;
    sourceGuid: string;
    system: boolean;
    likes: (User | string)[];
    attachments: Attachment[];
    constructor(client: Client, channel: Channel, data: APIGroupMessage | APIChatMessage) {
        this.id = data.id;
        this.user = client.users._upsert(
            new User({
                id: data.user_id,
                avatar: data.avatar_url,
                name: data.name,
            })
        );
        this.channel = channel;
        this.text = data.text;
        this.createdAt = data.created_at;
        this.sourceGuid = data.source_guid;
        this.system = 'system' in data ? data.system : false;
        this.likes = data.favorited_by.map(id => client.users.cache.get(id) || id);
        this.attachments = data.attachments;
    }
    fetch(): Promise<this> {
        throw new Error("Method not implemented.");
    }
    reply(message: string): Promise<Message> {
        throw new Error("Method not implemented.");
    }
    like(): Promise<this> {
        throw new Error("Method not implemented.");
    }
    unlike(): Promise<this> {
        throw new Error("Method not implemented.");
    }
    delete(): Promise<this> {
        throw new Error("Method not implemented.");
    }
    get canDelete(): boolean {
        throw new Error("Method not implemented.");
    }
}