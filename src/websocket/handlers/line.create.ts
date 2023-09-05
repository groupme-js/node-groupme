import type { APIGroupMessage } from 'groupme-api-types'
import { inspect } from 'util'
import type { Client } from '../..'
import { GroupMessage } from '../..'
import Handlers from './events'
import { getGroup } from './events/util'

export async function lineCreate(client: Client, msg: any) {
    const apiMessage: APIGroupMessage = msg.data.subject
    const group = await getGroup(client, apiMessage.group_id)
    if (!group) return
    if (apiMessage.event) {
        const event = apiMessage.event
        const eventType = event.type
        console.log(eventType, inspect(msg, false, 6, true))
        if (eventType in Handlers) Handlers[eventType](client, apiMessage, event as never)
        else console.log(`Unknown message event type: ${eventType}`, msg)
    }
    const message = group.messages._upsert(new GroupMessage(client, group, apiMessage))
    /**
     * Emitted whenever a message is sent.
     * @event Client#message
     * @param {GroupMessage} message The new message
     */
    client.emit('message', message)
    return
}
