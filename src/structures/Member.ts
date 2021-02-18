import Group from "./Group";
import User from "./User";

export type MemberData = {
    user: User;
    group: Group;
    memberID: string;
    nickname: string;
    muted: boolean;
    autokicked: boolean;
    roles: ["admin", "owner"] | ["admin"] | ["user"];
}

export default class Member {
    private readonly _user: User;
    public get user(): User {
        return this._user;
    }
    private readonly _group: Group;
    public get group(): Group {
        return this._group;
    }
    private readonly _memberID: string;
    public get memberID(): string {
        return this._memberID;
    }
    nickname: string;
    muted: boolean;
    autokicked: boolean;
    roles: ("admin" | "owner" | "user")[];

    public get admin(): boolean {
        return this.roles.includes("admin");
    }

    constructor(data: MemberData) {
        this._user = data.user;
        this._group = data.group;
        this._memberID = data.memberID;
        this.nickname = data.nickname;
        this.muted = data.muted;
        this.autokicked = data.autokicked;
        this.roles = data.roles;
    }
}