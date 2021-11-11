import type { Chat, Client, Collection } from "..";
import type ChatMessage from "../structures/ChatMessage";
import MessageManager, { MessageRequestParams } from "./MessageManager";

export default class ChatMessageManager extends MessageManager<Chat, ChatMessage> {
    constructor(client: Client, channel: Chat) {
        super(client, channel);
    }
    fetch(): Promise<Collection<string, ChatMessage>>;
    fetch(id: string): Promise<ChatMessage>;
    fetch(ids: string[]): Promise<Collection<string, ChatMessage>>;
    fetch(options: MessageRequestParams): Promise<Collection<string, ChatMessage>>;
    fetch(options?: any): Promise<Collection<string, ChatMessage>> | Promise<ChatMessage> {
        throw new Error("Method not implemented.");
    }
}