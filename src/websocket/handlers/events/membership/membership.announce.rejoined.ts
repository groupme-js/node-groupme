import type { APIGroupMessage, MembershipAnnounceRejoinedEvent } from 'groupme-api-types'
import type { Client } from '../../../..'

export async function rejoined(client: Client, message: APIGroupMessage, event: MembershipAnnounceRejoinedEvent) {
    return
}
