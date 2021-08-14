import { Client, Collection } from "..";
import { Chat, ChatData } from "../structures/Chat";
import BaseManager from "./BaseManager";

export default class ChatManager implements BaseManager {
    client: Client;
    cache: Collection<string, Chat>;
    constructor(client: Client) {
        this.client = client;
        this.cache = new Collection<string, Chat>();
    }

    /**
     * Constructs a Chat with the specified data and stores it in the cache.
     * If a Chat with the specified ID already exists, updates the existing
     * Chat with the given data.
     * @returns the created or modified Chat
     */
    public add(chatData: ChatData): Chat {
        const cachedChat = this.cache.get(chatData.id);
        if (cachedChat) {
            Object.assign(cachedChat, chatData);
            return cachedChat;
        }
        const chat = new Chat(chatData);
        this.cache.set(chat.id, chat);
        return chat;
    }
}