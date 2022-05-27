import type { Channel, Client, Collection, Message } from '..'
import { BaseManager } from '..'

export type MessageRequestParams = {
    before_id?: string
    since_id?: string
    after_id?: string
    limit?: number
}

interface MessageManagerInterface<T extends Channel, U extends Message<T>> {
    fetch(): Promise<Collection<string, U>>
    fetch(id: string): Promise<U>
    fetch(ids: string[]): Promise<Collection<string, U>>
    fetch(options: MessageRequestParams): Promise<Collection<string, U>>
}

export default abstract class MessageManager<
        T extends Channel,
        U extends Message<T>,
        UCtor extends new (...args: any[]) => U,
    >
    extends BaseManager<U, UCtor>
    implements MessageManagerInterface<T, U>
{
    readonly channel: T
    constructor(client: Client, channel: T, holds: UCtor) {
        super(client, holds)
        this.channel = channel
    }

    abstract fetch(): Promise<Collection<string, U>>
    abstract fetch(id: string): Promise<U>
    abstract fetch(ids: string[]): Promise<Collection<string, U>>
    abstract fetch(options: MessageRequestParams): Promise<Collection<string, U>>
}
