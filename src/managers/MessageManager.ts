import type { Channel, Client, Collection, Message } from "..";
import BaseManager from "./BaseManager";

export type MessageRequestParams = {
    before_id?: string;
    since_id?: string;
    after_id?: string;
    limit?: number;
};

interface MessageManagerInterface<T extends Message> {
    fetch(): Promise<Collection<string, T>>;
    fetch(id: string): Promise<T>;
    fetch(ids: string[]): Promise<Collection<string, T>>;
    fetch(options: MessageRequestParams): Promise<Collection<string, T>>;
}

export default abstract class MessageManager<
        T extends Channel,
        U extends Message
    >
    extends BaseManager<U>
    implements MessageManagerInterface<U>
{
    readonly channel: T;
    constructor(client: Client, channel: T) {
        super(client);
        this.channel = channel;
    }

    abstract fetch(): Promise<Collection<string, U>>;
    abstract fetch(id: string): Promise<U>;
    abstract fetch(ids: string[]): Promise<Collection<string, U>>;
    abstract fetch(
        options: MessageRequestParams
    ): Promise<Collection<string, U>>;
}
