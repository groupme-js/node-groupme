import type { APIGroupMessage, MessageDeletedEvent } from 'groupme-api-types'
import type { Client } from '../../../..'

export async function deleted(client: Client, message: APIGroupMessage, event: MessageDeletedEvent) {
    return
}
