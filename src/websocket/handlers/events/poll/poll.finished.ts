import type { APIGroupMessage, PollFinishedEvent } from 'groupme-api-types'
import type { Client } from '../../../..'

export async function finished(client: Client, message: APIGroupMessage, event: PollFinishedEvent) {
    return
}
