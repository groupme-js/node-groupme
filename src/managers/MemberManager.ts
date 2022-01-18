import type { Client, Collection, Member } from "..";
import type BaseGroup from "../structures/BaseGroup";
import BaseManager from "./BaseManager";
import FormerMemberManager from "./FormerMemberManager";

interface MemberManagerInterface {
    add(id: string): Promise<Member>;
    add(ids: string[]): Promise<Collection<string, Member>>;
    remove(member: Member): Promise<this>;
}

export default class MemberManager
    extends BaseManager<Member>
    implements MemberManagerInterface
{
    group: BaseGroup;
    former: FormerMemberManager;
    constructor(client: Client, group: BaseGroup) {
        super(client);
        this.group = group;
        this.former = new FormerMemberManager(client, group);
    }

    add(id: string): Promise<Member>;
    add(ids: string[]): Promise<Collection<string, Member>>;
    add(ids: any): Promise<Member> | Promise<Collection<string, Member>> {
        throw new Error("Method not implemented.");
    }
    remove(member: Member): Promise<this> {
        throw new Error("Method not implemented.");
    }
}
