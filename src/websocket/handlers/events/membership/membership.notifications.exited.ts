import type { APIGroupMessage, MembershipNotificationsExitedEvent } from 'groupme-api-types'
import type { Client } from '../../../..'

export async function exited(client: Client, message: APIGroupMessage, event: MembershipNotificationsExitedEvent) {
    return
}
