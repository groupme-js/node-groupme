import type { APIMember, PostMemberRemoveResponse } from 'groupme-api-types'
import type { BaseGroup, Client } from '..'
import { BaseManager, Collection, FormerMember, FormerMemberManager, FormerMemberState, Member } from '..'

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
    public fetch(id?: string): Promise<Collection<string, Member> | Member> {
        if (typeof id === 'string') {
            return this.fetchId(id)
        }
        return this.fetchAll()
    }

    private fetchId(id: string): Promise<Member> {
        throw new Error('Method not implemented.')
    }

    private async fetchAll(): Promise<Collection<string, Member>> {
        const membersResponse = await this.client.rest.api<APIMember[]>('GET', `groups/${this.group.id}/members`)
        const batch = new Collection<string, Member>()

        membersResponse.forEach(data => {
            const user = this.client.users._add({
                id: data.user_id,
                avatar_url: data.image_url,
                name: data.name,
            })

            const member = this._upsert(new Member(this.client, this.group, user, data))
            batch.set(member.memberID, member)
        })

        return batch
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
