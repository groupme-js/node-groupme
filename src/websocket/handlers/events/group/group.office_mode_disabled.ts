import type { APIGroupMessage, GroupOfficeModeDisabledEvent } from 'groupme-api-types'
import type { Client } from '../../../..'

export async function officeModeDisabled(
    client: Client,
    message: APIGroupMessage,
    event: GroupOfficeModeDisabledEvent,
) {
    return
}
