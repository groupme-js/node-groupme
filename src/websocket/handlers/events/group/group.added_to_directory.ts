import type { APIGroupMessage, GroupAddedToDirectoryEvent } from 'groupme-api-types'
import type { Client } from '../../../..'

export async function addedToDirectory(client: Client, message: APIGroupMessage, event: GroupAddedToDirectoryEvent) {
    return
}
