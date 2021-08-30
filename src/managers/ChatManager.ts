import { Client, Collection } from "..";
import { ChatsIndexResponse, toChats } from "../interfaces"
import { Chat, ChatData } from "../structures/Chat";
import BaseManager from "./BaseManager";

type ChatsRequestParams = {
    page?: number,
    per_page?: number
}

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

    async fetchChats(options?: {
        page?: number,
        per_page?: number,
    }) {
        const apiParams: ChatsRequestParams = {};
        if (options) {
            // If no pagination is specified, recursively fetch all chats
            if (options.page === undefined && options.per_page === undefined) {
                let batch, i = 1;
                do batch = await this.fetchChats({ page: i++ });
                while (batch.size);
                return this.client.chats.cache;
            }
            // Translate the options into valid API parameters
            if (options.page != undefined) apiParams.page = options.page;
            if (options.per_page != undefined) apiParams.per_page = options.per_page;
        }

        const batch = new Collection<string, Chat>()
        const chats = await this.client.rest.api<ChatsIndexResponse[]>("GET", "chats", toChats, { query: apiParams });

        chats.forEach(c => {
            const chat = this.client.chats.add({
                client: this.client,
                createdAt: c.created_at,
                updatedAt: c.updated_at,
                id: c.other_user.id,
                conversation_id: c.last_message.conversation_id,
                recipient: this.client.users.add({
                    id: c.other_user.id,
                    name: c.other_user.name,
                    avatar: c.other_user.avatar_url,
                }),
                lastMessage: {
                    id: c.last_message.id,
                    attachments: c.last_message.attachments,
                    createdAt: c.last_message.created_at,
                    text: c.last_message.text,
                    user: {
                        nickname: c.last_message.name,
                        image_url: c.last_message.avatar_url,
                    },
                },
                messageCount: c.messages_count,
                messageDeletionMode: c.message_deletion_mode,
                messageDeletionPeriod: c.message_deletion_period,
            });
            batch.set(chat.recipient.id, chat);
        });
        return batch;
    }
}