import type { APIGroupMessage, MembershipAvatarChangedEvent } from 'groupme-api-types'
import type { Client } from '../../../..'

export async function avatarChanged(client: Client, message: APIGroupMessage, event: MembershipAvatarChangedEvent) {
    return
}
