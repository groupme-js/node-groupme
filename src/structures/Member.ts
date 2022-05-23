import type { APIMember } from 'groupme-api-types'
import type { BaseGroup, Client, User } from '..'
import { Base } from '..'

interface MemberInterface {}

export default class Member extends Base implements MemberInterface {
    readonly user: User
    readonly group: BaseGroup
    readonly memberID: string
    nickname: string
    image_url: string | null
    muted: boolean
    // autokicked: boolean
    roles: ('admin' | 'owner' | 'user')[]

    constructor(client: Client, group: BaseGroup, user: User, data: APIMember) {
        super(client, user.id)
        this.user = user
        this.group = group
        this.memberID = data.id
        this.nickname = data.nickname
        this.image_url = data.image_url
        this.muted = data.muted
        // this.autokicked = data.autokicked
        this.roles = data.roles
    }

    _patch(data: Partial<APIMember>): this {
        this.user._patch({
            name: data.name,
            // don't bother updating the user avatar because we don't know whether it's real or not
        })

        if (data.nickname !== undefined) this.nickname = data.nickname
        if (data.image_url !== undefined) this.image_url = data.image_url
        if (data.muted !== undefined) this.muted = data.muted
        if (data.roles !== undefined) this.roles = data.roles

        return this
    }

    get isAdmin(): boolean {
        return this.roles.includes('admin') || this.isOwner
    }

    get isOwner(): boolean {
        return this.user.id === this.group.creatorID
    }

    get canLeaveGroup(): boolean {
        return !this.isOwner
    }

    get canUpdateGroup(): boolean {
        return this.isAdmin || !this.group.closed
    }

    get canAddMembers(): boolean {
        return this.isAdmin || !this.group.closed
    }

    get canRemoveMembers(): boolean {
        return this.isAdmin || !this.group.closed
    }

    get canDeleteGroup(): boolean {
        return this.isOwner
    }

    get canTransferGroup(): boolean {
        return this.isOwner
    }
}
