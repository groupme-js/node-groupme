import { Channel } from "./Channel";
import { User } from "./User";

export type ChatData = Omit<Chat, "type">

interface ChatInterface {

}

export class Chat extends Channel implements ChatInterface {
    readonly type: "dm" = "dm";
    conversation_id: string;
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
            messageDeletionMode: data.messageDeletionMode,
            messageDeletionPeriod: data.messageDeletionPeriod,
        })
        this.conversation_id = data.conversation_id;
        this.recipient = data.recipient;
    }
}