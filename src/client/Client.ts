import EventEmitter from "events";
import ChatManager from "../managers/ChatManager";
import GroupManager from "../managers/GroupManager";
import UserManager from "../managers/UserManager";
import RESTManager from "../rest/rest";
import WS from "../util/Websocket";
import { ClientUser } from "./ClientUser";

export class Client extends EventEmitter {
    groups: GroupManager;
    users: UserManager;
    chats: ChatManager;
    token: string;
    rest: RESTManager;
    ws: WS;
    user?: ClientUser;
    constructor(token: string) {
        super();
        this.token = token;
        this.groups = new GroupManager(this);
        this.users = new UserManager(this);
        this.chats = new ChatManager(this);
        this.rest = new RESTManager(this);
        this.ws = new WS(this)
    }
    async login() {
        // GET /me
    }
}
