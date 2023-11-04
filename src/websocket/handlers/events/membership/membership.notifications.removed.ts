import type { APIGroupMessage, MembershipNotificationsRemovedEvent } from 'groupme-api-types'
import type { Client } from '../../../..'

export async function removed(client: Client, message: APIGroupMessage, event: MembershipNotificationsRemovedEvent) {
    return
}
