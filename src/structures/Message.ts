import type { Channel, User } from "..";
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
    text: string;
    createdAt: number;
    sourceGuid: string;
    system: boolean;
    likes: User[];
    attachments: Attachment[];
    constructor(data: Message) {
        this.id = data.id;
        this.user = data.user;
        this.channel = data.channel;
        this.text = data.text;
        this.createdAt = data.createdAt;
        this.sourceGuid = data.sourceGuid;
        this.system = data.system;
        this.likes = data.likes;
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