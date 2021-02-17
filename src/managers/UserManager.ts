import Client from "client/Client";
import User from "structures/User";
import Collection from "util/Collection";
import BaseManager from "./BaseManager";

export default class UserManager implements BaseManager {
    client: Client;
    cache: Collection<string, User>;
    constructor(client: Client) {
        this.client = client;
        this.cache = new Collection<string, User>();
    }

    /**
     * Fetches a user by their GroupMe ID.
     */
    public fetch(id: string) {

    }
}