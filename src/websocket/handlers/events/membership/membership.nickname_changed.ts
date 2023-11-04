import type { APIGroupMessage, MembershipNicknameChangedEvent } from 'groupme-api-types'
import type { Client } from '../../../..'

export async function nicknameChanged(client: Client, message: APIGroupMessage, event: MembershipNicknameChangedEvent) {
    return
}
