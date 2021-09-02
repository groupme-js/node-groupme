import { Client, Collection } from "..";
import { Message } from "../structures/Message";
import BaseManager from "./BaseManager";

interface MessageManagerInterface {

}

export default class MessageManager extends BaseManager implements MessageManagerInterface {
    client: Client;
    cache: Collection<string, Message>;
    constructor(client: Client) {
        super();
        this.client = client;
        this.cache = new Collection<string, Message>();
    }

    
    public name(): Message {
        throw new Error("Not yet implemented");
        
    }
}