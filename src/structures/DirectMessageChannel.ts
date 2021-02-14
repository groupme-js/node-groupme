import ChatChannel from "./ChatChannel";
import Message from "./Message";
import User from "./User";

export default class DirectMessageChannel implements ChatChannel {
    type: "dm" = "dm";
    id: string;
    messageCount: number;
    lastMessage: Message;
    createdAt: Date;
    updatedAt: Date;
    recipient: User;
    constructor(data: Omit<DirectMessageChannel, "type">) {
        this.id = data.id;
        this.messageCount = data.messageCount;
        this.lastMessage = data.lastMessage;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.recipient = data.recipient;
    }
}