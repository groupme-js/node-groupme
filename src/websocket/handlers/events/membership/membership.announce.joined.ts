import type { APIGroupMessage, MembershipAnnounceJoinedEvent } from 'groupme-api-types'
import type { Client } from '../../../..'

export async function joined(client: Client, message: APIGroupMessage, event: MembershipAnnounceJoinedEvent) {
    return
}
