import type { BaseGroup, Client, Collection } from '..'
import { BaseManager, FormerMemberManager, Member } from '..'

interface MemberManagerInterface {
    add(id: string): Promise<Member>
    add(ids: string[]): Promise<Collection<string, Member>>
    remove(member: Member): Promise<this>
}

export default class MemberManager extends BaseManager<Member, typeof Member> implements MemberManagerInterface {
    group: BaseGroup
    former: FormerMemberManager
    constructor(client: Client, group: BaseGroup) {
        super(client, Member)
        this.group = group
        this.former = new FormerMemberManager(client, group)
    }

    add(id: string): Promise<Member>
    add(ids: string[]): Promise<Collection<string, Member>>
    add(ids: string | string[]): Promise<Member> | Promise<Collection<string, Member>> {
        throw new Error('Method not implemented.')
    }
    remove(member: Member): Promise<this> {
        throw new Error('Method not implemented.')
    }
}
