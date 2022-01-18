import type { APIMember } from "groupme-api-types";
import type { Client, User } from "..";
import type BaseGroup from "./BaseGroup";

interface MemberInterface {}

export default class Member implements MemberInterface {
    readonly user: User;
    readonly group: BaseGroup;
    readonly memberID: string;
    readonly client: Client;
    readonly id: string;
    nickname: string;
    muted: boolean;
    autokicked: boolean;
    roles: ("admin" | "owner" | "user")[];

    constructor(client: Client, group: BaseGroup, user: User, data: APIMember) {
        this.client = client;
        this.id = user.id;
        this.user = user;
        this.group = group;
        this.memberID = data.id;
        this.nickname = data.nickname;
        this.muted = data.muted;
        this.autokicked = data.autokicked;
        this.roles = data.roles;
    }

    get isAdmin(): boolean {
        return this.roles.includes("admin") || this.isOwner;
    }

    get isOwner(): boolean {
        return this.user.id === this.group.creatorID;
    }

    get canLeaveGroup(): boolean {
        return !this.isOwner;
    }

    get canUpdateGroup(): boolean {
        return this.isAdmin || !this.group.closed;
    }

    get canAddMembers(): boolean {
        return this.isAdmin || !this.group.closed;
    }

    get canRemoveMembers(): boolean {
        return this.isAdmin || !this.group.closed;
    }

    get canDeleteGroup(): boolean {
        return this.isOwner;
    }

    get canTransferGroup(): boolean {
        return this.isOwner;
    }
}
