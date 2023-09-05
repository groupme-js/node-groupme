import type { APIGroupMessage, MembershipNotificationsAutokickedEvent } from 'groupme-api-types'
import type { Client } from '../../../..'

export async function autokicked(
    client: Client,
    message: APIGroupMessage,
    event: MembershipNotificationsAutokickedEvent,
) {
    return
}
