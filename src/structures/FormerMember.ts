import type { APIMember } from 'groupme-api-types'
import type { BaseGroup, Client, User } from '..'
import { Member } from '..'

export enum FormerMemberState {
    Exited = 'exited',
    ExitedRemoved = 'exited_removed',
    Removed = 'removed',
}

interface FormerMemberInterface {
    ban(): Promise<this>
    rejoin(): Promise<this>
}

export default class FormerMember extends Member implements FormerMemberInterface {
    state: FormerMemberState
    constructor(client: Client, group: BaseGroup, user: User, data: APIMember, state: FormerMemberState)
    constructor(client: Client, group: BaseGroup, user: User, data: Member, state: FormerMemberState)
    constructor(client: Client, group: BaseGroup, user: User, data: APIMember | Member, state: FormerMemberState) {
        let memberData = data
        if (memberData instanceof Member) {
            memberData = {
                id: memberData.memberID,
                image_url: memberData.image_url,
                muted: memberData.muted,
                name: memberData.user.name,
                nickname: memberData.nickname,
                roles: memberData.roles,
                user_id: memberData.user.id,
            }
        }
        super(client, group, user, memberData)
        this.state = state
    }
    ban(): Promise<this> {
        throw new Error('Method not implemented.')
    }
    rejoin(): Promise<this> {
        throw new Error('Method not implemented.')
    }
}
