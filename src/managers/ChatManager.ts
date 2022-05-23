import type { APIChat } from 'groupme-api-types'
import type { Client } from '..'
import { BaseManager, Chat, Collection, User } from '..'

type ChatsRequestParams = {
    page?: number
    per_page?: number
}

interface ChatManagerInterface {
    client: Client
    cache: Collection<string, Chat>
    fetch(): Promise<Collection<string, Chat>>
    fetch(id: string): Promise<Chat>
    fetch(ids: string[]): Promise<Collection<string, Chat | null>>
}

export default class ChatManager extends BaseManager<Chat, typeof Chat> implements ChatManagerInterface {
    constructor(client: Client) {
        super(client, Chat)
    }

    fetch(): Promise<Collection<string, Chat>>
    fetch(id: string): Promise<Chat>
    fetch(ids: string[]): Promise<Collection<string, Chat | null>>
    fetch(
        ids?: string | string[],
    ): Promise<Collection<string, Chat>> | Promise<Chat> | Promise<Collection<string, Chat | null>> {
        throw new Error('Method not implemented.')
    }

    async fetchChats(options?: { page?: number; per_page?: number }) {
        const apiParams: ChatsRequestParams = {}
        if (options) {
            // If no pagination is specified, recursively fetch all chats
            if (options.page === undefined && options.per_page === undefined) {
                let batch,
                    i = 1
                do batch = await this.fetchChats({ page: i++ })
                while (batch.size)
                return this.cache
            }
            // Translate the options into valid API parameters
            if (options.page != undefined) apiParams.page = options.page
            if (options.per_page != undefined) apiParams.per_page = options.per_page
        }

        const batch = new Collection<string, Chat>()
        const chats = await this.client.rest.api<APIChat[]>('GET', 'chats', { query: apiParams })

        chats.forEach(data => {
            const chat = this._upsert(
                new Chat(
                    this.client,
                    this.client.users._upsert(
                        new User(this.client, {
                            id: data.other_user.id,
                            name: data.other_user.name,
                            avatar_url: data.other_user.avatar_url,
                        }),
                    ),
                    data,
                ),
            )
            batch.set(chat.recipient.id, chat)
        })
        return batch
    }
}
