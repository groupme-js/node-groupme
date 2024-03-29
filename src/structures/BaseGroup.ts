import type { APIGroup } from 'groupme-api-types'
import type { Client } from '..'
import { Channel, MemberManager } from '..'

export default abstract class BaseGroup extends Channel {
    readonly members: MemberManager
    name: string
    phoneNumber: string | null
    closed: boolean
    imageURL: string | null
    creatorID: string
    mutedUntil?: number | null
    officeMode: boolean
    inviteURL: string | null
    inviteQR: string | null
    maxMembers: number
    theme: string | null
    likeIcon: {
        type: 'emoji'
        packId: number
        packIndex: number
    } | null
    requiresApproval: boolean
    showJoinQuestion: boolean
    joinQuestion: string | null
    constructor(client: Client, data: APIGroup) {
        super(client, Channel.dataFromGroup(data))
        this.members = new MemberManager(this.client, this)
        this.name = data.name
        this.phoneNumber = data.phone_number
        this.closed = data.type == 'closed'
        this.imageURL = data.image_url
        this.creatorID = data.creator_user_id
        this.mutedUntil = data.muted_until
        this.officeMode = data.office_mode
        this.inviteURL = data.share_url
        this.inviteQR = data.share_qr_code_url
        this.maxMembers = data.max_members
        this.theme = data.theme_name
        this.likeIcon = data.like_icon
            ? {
                  packId: data.like_icon.pack_id,
                  packIndex: data.like_icon.pack_index,
                  type: 'emoji',
              }
            : null
        this.requiresApproval = data.requires_approval
        this.showJoinQuestion = data.show_join_question
        this.joinQuestion = data.join_question ? data.join_question.text : null
    }
    _patch(data: Partial<APIGroup>): this {
        Channel._patch(this, Channel.dataFromGroup(data as APIGroup)) // this is dangerous

        if (data.name !== undefined) this.name = data.name
        if (data.phone_number !== undefined) this.phoneNumber = data.phone_number
        if (data.type !== undefined) this.closed = data.type == 'closed'
        if (data.image_url !== undefined) this.imageURL = data.image_url
        if (data.creator_user_id !== undefined) this.creatorID = data.creator_user_id
        if (data.muted_until !== undefined) this.mutedUntil = data.muted_until
        if (data.office_mode !== undefined) this.officeMode = data.office_mode
        if (data.share_url !== undefined) this.inviteURL = data.share_url
        if (data.share_qr_code_url !== undefined) this.inviteQR = data.share_qr_code_url
        if (data.max_members !== undefined) this.maxMembers = data.max_members
        if (data.theme_name !== undefined) this.theme = data.theme_name
        if (data.like_icon !== undefined)
            this.likeIcon = data.like_icon
                ? {
                      packId: data.like_icon.pack_id,
                      packIndex: data.like_icon.pack_index,
                      type: 'emoji',
                  }
                : null
        if (data.requires_approval !== undefined) this.requiresApproval = data.requires_approval
        if (data.show_join_question !== undefined) this.showJoinQuestion = data.show_join_question
        if (data.join_question !== undefined) this.joinQuestion = data.join_question ? data.join_question.text : null

        return this
    }
}
