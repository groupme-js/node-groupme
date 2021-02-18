import { Client } from "client/Client";
import { User, UserData } from "structures/User";
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
     * Constructs a User with the specified data and stores it in the cache.
     * If a User with the specified ID already exists, updates the existing
     * User with the given data.
     * @returns the created or modified User
     */
    public add(userData: UserData): User {
        let user: User;
        const cachedUser = this.cache.get(userData.id);
        if (cachedUser) {
            cachedUser.name = userData.name;
            cachedUser.avatar = userData.avatar;
            user = cachedUser;
        } else {
            user = new User(userData);
            this.cache.set(user.id, user);
        }
        return user;
    }
}