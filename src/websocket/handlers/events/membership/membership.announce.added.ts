import type { APIGroupMessage, MembershipAnnounceAddedEvent } from 'groupme-api-types'
import type { Client, Member } from '../../../..'
import { getGroup, getMember } from '../util'

export async function added(client: Client, message: APIGroupMessage, event: MembershipAnnounceAddedEvent) {
    const group = await getGroup(client, message.group_id)
    if (!group) return
    const initiatorMember = await getMember(client, message.group_id, event.data.adder_user.id)
    if (!initiatorMember) return
    const members: Member[] = []
    for (const data of event.data.added_users) {
        const member = await getMember(client, message.group_id, data.id)
        if (!member) continue
        members.push(member)
    }
    if (!members.length) return
    /**
     * Emitted whenever a member adds member(s) to a group.
     * @event Client#membersAdd
     * @param {Member[]} members The new member(s)
     * @param {Member} initiatorMember The member who added them
     * @param {Group} group The group which members were added to
     */
    client.emit('membersAdd', members, initiatorMember, group)
    return
}
