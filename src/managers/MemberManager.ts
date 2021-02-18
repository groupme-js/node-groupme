import Collection from "util/Collection";
import { Group } from "structures/Group";
import BaseManager from "./BaseManager";
import { Member, MemberData } from "structures/Member";
import { Client } from "client/Client";

export default class MemberManager implements BaseManager {
    client: Client;
    group: Group;
    cache: Collection<string, Member>;
    constructor(client: Client, group: Group) {
        this.client = client;
        this.group = group;
        this.cache = new Collection<string, Member>();
    }

    /**
     * Constructs a Member with the specified data and stores it in the cache.
     * If a Member with the specified ID already exists, updates the existing
     * Member with the given data.
     * @returns the created or modified Member
     */
    public add(memberData: MemberData): Member {
        let member: Member;
        const cachedMember = this.cache.get(memberData.memberID);
        if (cachedMember) {
            cachedMember.autokicked = memberData.autokicked;
            cachedMember.muted = memberData.muted;
            cachedMember.nickname = memberData.nickname;
            cachedMember.roles = memberData.roles;
            member = cachedMember;
        } else {
            member = new Member(memberData);
            this.cache.set(member.memberID, member);
        }
        return member;
    }
}