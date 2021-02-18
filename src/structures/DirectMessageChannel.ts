import Channel from "./Channel";
import User from "./User";

export type ChatData = Omit<DirectMessageChannel, "type">

export default class DirectMessageChannel extends Channel {
    readonly type: "dm" = "dm";
    recipient: User;
    constructor(data: ChatData) {
        super({
            id: data.id,
            type: "dm",
            client: data.client,
            lastMessage: data.lastMessage,
            messageCount: data.messageCount,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        })
        this.recipient = data.recipient;
    }
}