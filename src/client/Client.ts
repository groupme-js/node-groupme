import EventEmitter from "events";
import GroupManager from "../managers/GroupManager";
import UserManager from "../managers/UserManager";
import ChatManager from "../managers/ChatManager";
import RESTManager from "../rest/rest";

export class Client extends EventEmitter {
    groups: GroupManager;
    users: UserManager;
    chats: ChatManager;
    token: string;
    rest: RESTManager;
    constructor(token: string) {
        super();
        this.token = token;
        this.groups = new GroupManager(this);
        this.users = new UserManager(this);
        this.chats = new ChatManager(this);
        this.rest = new RESTManager(this);
    }
}