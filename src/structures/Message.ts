import { Attachment } from "./Attachment";
import ChatChannel from "./ChatChannel";
import User from "./User";

export default class Message {
    id: string;
    user: User;
    channel: ChatChannel;
    text: string;
    createdAt: Date;
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
}