import { Channel, Client, Collection, Message } from "..";
import BaseManager from "./BaseManager";

interface MessageManagerInterface {
    fetch(): Promise<Collection<string, Message>>
}

export default abstract class MessageManager<T extends Channel, U extends Message> extends BaseManager<U> implements MessageManagerInterface {
    readonly channel: T;
    constructor(client: Client, channel: T) {
        super(client);
        this.channel = channel;
    }
    abstract fetch(): Promise<Collection<string, U>>
}