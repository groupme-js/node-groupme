import { Client, Group, User } from "..";
import { APIMember } from "../interfaces";

interface MemberInterface {

}

export default class Member implements MemberInterface {
    private readonly _user: User;
    private readonly _group: Group;
    private readonly _memberID: string;
    public get user(): User { return this._user }
    public get group(): Group { return this._group }
    public get memberID(): string { return this._memberID }
    readonly client: Client;
    readonly id: string;
    nickname: string;
    muted: boolean;
    autokicked: boolean;
    roles: ("admin" | "owner" | "user")[];

    public get isAdmin(): boolean {
        return this.roles.includes("admin");
    }

    constructor(client: Client, group: Group, user: User, data: APIMember) {
        this.client = client;
        this.id = user.id;
        this._user = user;
        this._group = group;
        this._memberID = data.id;
        this.nickname = data.nickname;
        this.muted = data.muted;
        this.autokicked = data.autokicked;
        this.roles = data.roles;
    }
}