import Client from "client/Client";
import GroupChatChannel from "structures/GroupChatChannel";
import Collection from "util/Collection";
import BaseManager from "./BaseManager";

export default class GroupManager implements BaseManager {
    client: Client;
    cache: Collection<string, GroupChatChannel>;
    constructor(client: Client) {
        this.client = client;
        this.cache = new Collection<string, GroupChatChannel>();
    }

    /**
     * Fetches a group by its GroupMe ID.
     */
    public fetch() {
        
    }
}