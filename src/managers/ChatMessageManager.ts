import { Chat, Client, Collection } from "..";
import ChatMessage from "../structures/ChatMessage";
import MessageManager from "./MessageManager";

export default class ChatMessageManager extends MessageManager<Chat, ChatMessage> {
    constructor(client: Client, channel: Chat) {
        super(client, channel);
    }
    fetch(): Promise<Collection<string, ChatMessage>> {
        throw new Error("Method not implemented.");
    }
}