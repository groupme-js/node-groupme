import { ok } from "assert";
import fetch from "node-fetch"
import WebSocket from "ws"
import { Client } from "..";

type ArrayResponse = [
    {
        "id"?: string,
        "channel"?: "/meta/handshake",
        "successful"?: boolean,
        "version"?: string,
        "supportedConnectionTypes"?: [
            "long-polling",
            "cross-origin-long-polling",
            "callback-polling",
            "websocket",
            "eventsource",
            "in-process"
        ],
        "clientId"?: string,
        "advice"?: {
            "reconnect": "retry",
            "interval": 0,
            "timeout": 600000
        }
    }
]

async function handshake(token: string) {
    const res = await fetch('https://push.groupme.com/faye', {
        method: 'POST',
        headers: { 'X-Access-Token': token },
        body: JSON.stringify([{
            "channel": "/meta/handshake",
            "version": "1.0",
            "supportedConnectionTypes": ["websocket"],
            "id": "1"
        }])
    });
    const data = await (res.json() as Promise<ArrayResponse>);
    ok(data && data[0] && data[0].clientId);
    const clientID = data[0].clientId;
    return clientID;
}

export default class WS {
    client: Client;
    private ws?: WebSocket
    private client_id?: string;
    private request_id: number = 1
    constructor(client: Client) {
        this.client = client;
        this.init()
    }
    async init() {
        this.client_id = await handshake(this.client.token);

        this.ws = new WebSocket('wss://push.groupme.com/faye')
            .on('open', this.openCallback)

        this.debug();



    }
    private send(data: any) {
        ok(this.ws)
        data.id = this.request_id++;
        data.clientId = this.client_id;
        this.ws.send(JSON.stringify([data]), err => {
            if (err) {
                console.error('An error occurred while trying to send:', data)
                throw err;
            }
            console.log('SENT:', data)
        })
    }
    private connect() {
        this.send({
            "channel": "/meta/connect",
            "connectionType": "websocket",
        })
    }
    private subscribe(channel: string) {
        this.send({
            "channel": "/meta/subscribe",
            "subscription": channel,
            "ext": { "access_token": this.client.token }
        })
    }
    private receive(data: WebSocket.Data) {
        const parsed = JSON.parse(data.toString())[0]
        if (parsed.channel == '/meta/connect') return this.connect()
        // Handle incoming websocket messages
    }
    private openCallback = () => {
        ok(this.ws && this.client.user)
        this.ws.on('message', this.subscribeCallback)
        this.subscribe(this.client.user.id)
    }
    private subscribeCallback = (data: WebSocket.Data) => {
        ok(this.ws)
        console.log('SUBSCRIBE CALLBACK')
        const parsed = JSON.parse(data.toString())[0]
        if (parsed.channel != '/meta/subscribe') return;
        console.log('SUBSCRIBE RUNNING CONNECT')
        this.ws.off('message', this.subscribeCallback)
        this.ws.on('message', this.receive)
        this.connect()
    }
    debug() {
        ok(this.ws)

        this.ws.on('open', () => {
            console.log('Event: OPEN')
        }).on('upgrade', (request) => {
            console.log('Event: UPGRADE')
            console.log('Request:', request.headers)
        }).on('close', (code, reason) => {
            console.log('Event: CLOSE')
            console.log('Code:', code)
            console.log('Reason:', reason.toString())
            console.log()
        }).on('message', (data) => {
            console.log('MESSAGE:', JSON.parse(data.toString())[0])
        }).on('ping', (data) => {
            console.log('PING:', data.toString())
        }).on('pong', (data) => {
            console.log('PONG:', data.toString())
        }).on('error', (err) => {
            console.log('Event: ERROR')
            console.log('Error:', err)
        }).on('unexpected-response', (request, response) => {
            console.log('Event: UNEXPECTED RESPONSE')
            console.log('Request:', request.getHeaders())
            console.log('Response:', response.headers)
        })
    }

}