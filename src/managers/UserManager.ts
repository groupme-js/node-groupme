import { Client, User } from "..";
import BaseManager from "./BaseManager";

interface UserManagerInterface {

}

export default class UserManager extends BaseManager<User> implements UserManagerInterface {
    constructor(client: Client) {
        super(client);
    }

}