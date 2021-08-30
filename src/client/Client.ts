import EventEmitter from "events";
import { Me, toMe } from "../interfaces";
import ChatManager from "../managers/ChatManager";
import GroupManager from "../managers/GroupManager";
import UserManager from "../managers/UserManager";
import RESTManager from "../rest/rest";
import WS from "../util/Websocket";
import { ClientUser } from "./ClientUser";

interface ClientInterface {
    groups: GroupManager
    chats: ChatManager
    users: UserManager
    user?: ClientUser
    login: () => Promise<Client>
}

export class Client extends EventEmitter implements ClientInterface {
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
    login = async (): Promise<this> => {
        const me = await this.rest.api<Me>("GET", "users/me", toMe)
        this.user = new ClientUser({
            avatar: me.image_url,
            id: me.user_id,
            name: me.name
        })
        await this.ws.init()
        return this;
    }
}
