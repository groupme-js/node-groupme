import Faye from 'faye'
import type { Client } from '..'
import Handlers from './handlers'

// Faye.logger = console;

export default class WS {
    client: Client
    private faye?: typeof Faye.Client
    constructor(client: Client) {
        this.client = client
    }
    init = async () => {
        return new Promise<void>((resolve, reject) => {
            if (!this.client.user) return reject('Client user must be defined before init')
            this.faye = new Faye.Client('https://push.groupme.com/faye', {
                timeout: 30,
                retry: 5,
            })
            this.faye.addExtension({
                outgoing: (
                    msg: { channel: string; ext: { access_token: string } },
                    callback: (msg: unknown) => void,
                ) => {
                    if (!msg.channel.match(/\/meta\/(?!subscribe)/)) msg.ext = { access_token: this.client.token }
                    callback(msg)
                },

                incoming: (msg: { data?: { type?: string } }, callback: (msg: unknown) => void) => {
                    if (!msg.data?.type) return callback(msg)

                    if (msg.data.type in Handlers) Handlers[msg.data.type](this.client, msg)
                    else console.log(`Unknown websocket message type: ${msg.data.type}`, msg)

                    callback(msg)
                },
            })
            this.faye.subscribe(`/user/${this.client.user.id}`).then(() => resolve())
            // this.debug()
        })
    }

    async subscribeToGroup(id: string): Promise<void> {
        return await this.faye.subscribe(`/group/${id}`)
    }

    async close(): Promise<void> {
        return await this.faye.disconnect()
    }

    debug() {
        this.faye.addExtension({
            outgoing: (msg: unknown, callback: (msg: unknown) => void) => {
                console.log('[SENT]', msg)
                callback(msg)
            },
            incoming: (msg: unknown, callback: (msg: unknown) => void) => {
                console.log('[RECD]', msg)
                callback(msg)
            },
        })
    }
}
