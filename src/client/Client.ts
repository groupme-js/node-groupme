import EventEmitter from 'events'
import type { APIClientUser } from 'groupme-api-types'
import { ChatManager, GroupManager, RelationshipManager, UserManager } from '..'
import RESTManager from '../rest/rest'
import WS from '../websocket/Websocket'
import ClientUser from './ClientUser'

interface ClientInterface {
    relationships: RelationshipManager
    groups: GroupManager
    chats: ChatManager
    users: UserManager
    user: ClientUser
    login: () => Promise<Client>
    logout: () => Promise<void>
}

export type ClientOptions = {
    websocket?: boolean
    fetchPartials?: boolean | (keyof Client['options']['fetchPartials'])[]
}

export default class Client extends EventEmitter implements ClientInterface {
    relationships: RelationshipManager
    groups: GroupManager
    users: UserManager
    chats: ChatManager
    token: string
    rest: RESTManager
    ws: WS
    user!: ClientUser
    options = {
        websocket: true,
        fetchPartials: {
            user: true,
            group: true,
            member: true,
            message: true,
            calendar: true,
            poll: true,
        },
    }
    constructor(token: string, options?: ClientOptions) {
        super()
        this.token = token
        this.relationships = new RelationshipManager(this)
        this.groups = new GroupManager(this)
        this.users = new UserManager(this)
        this.chats = new ChatManager(this)
        this.rest = new RESTManager(this)
        this.ws = new WS(this)
        if (typeof options !== 'undefined') {
            if (options.websocket === false) this.options.websocket = false
            let key: keyof typeof this.options.fetchPartials
            for (key in this.options.fetchPartials)
                if (typeof options.fetchPartials === 'boolean') this.options.fetchPartials[key] = options.fetchPartials
                else if (options.fetchPartials) this.options.fetchPartials[key] = options.fetchPartials.includes(key)
        }
    }
    login = async (): Promise<Client> => {
        const me = await this.rest.api<APIClientUser>('GET', 'users/me')
        this.user = new ClientUser(this, {
            avatar: me.image_url,
            id: me.user_id,
            name: me.name,
        })
        if (this.options.websocket) await this.ws.init()
        return this
    }
    logout = async (): Promise<void> => {
        await this.ws.close()
    }
}
