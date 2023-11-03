import type { PostMemberRemoveResponse } from 'groupme-api-types'
import type { BaseGroup, Client, Collection } from '..'
import { BaseManager, FormerMember, FormerMemberManager, FormerMemberState, Member } from '..'

interface MemberManagerInterface {
    add(id: string): Promise<Member>
    add(ids: string[]): Promise<Collection<string, Member>>
    remove(member: Member): Promise<FormerMember>
}

export default class MemberManager extends BaseManager<Member, typeof Member> implements MemberManagerInterface {
    group: BaseGroup
    former: FormerMemberManager
    constructor(client: Client, group: BaseGroup) {
        super(client, Member)
        this.group = group
        this.former = new FormerMemberManager(client, group)
    }

    fetch(): Promise<Collection<string, Member>>
    fetch(id: string): Promise<Member>
    public async fetch(id?: string): Promise<Collection<string, Member> | Member> {
        throw new Error('Method not implemented.')
    }
    add(id: string): Promise<Member>
    add(ids: string[]): Promise<Collection<string, Member>>
    add(ids: string | string[]): Promise<Member> | Promise<Collection<string, Member>> {
        throw new Error('Method not implemented.')
    }
    async remove(member: Member): Promise<FormerMember> {
        await this.client.rest.api<PostMemberRemoveResponse>(
            'POST',
            `groups/${this.group.id}/members/${member.memberID}/remove`,
        )
        const formerMember = new FormerMember(this.client, this.group, member.user, member, FormerMemberState.Removed)
        this.former._upsert(formerMember)
        this._remove(member)
        return formerMember
    }
}
