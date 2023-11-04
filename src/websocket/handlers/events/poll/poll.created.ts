import type { APIGroupMessage, PollCreatedEvent } from 'groupme-api-types'
import type { Client } from '../../../..'

export async function created(client: Client, message: APIGroupMessage, event: PollCreatedEvent) {
    return
}
