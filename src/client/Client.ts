import EventEmitter from 'events'
import type { APIClientUser } from 'groupme-api-types'
import { ChatManager, GroupManager, RelationshipManager, UserManager } from '..'
import RESTManager from '../rest/rest'
import WS from '../util/Websocket'
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

export default class Client extends EventEmitter implements ClientInterface {
    relationships: RelationshipManager
    groups: GroupManager
    users: UserManager
    chats: ChatManager
    token: string
    rest: RESTManager
    ws: WS
    user!: ClientUser
    constructor(token: string) {
        super()
        this.token = token
        this.relationships = new RelationshipManager(this)
        this.groups = new GroupManager(this)
        this.users = new UserManager(this)
        this.chats = new ChatManager(this)
        this.rest = new RESTManager(this)
        this.ws = new WS(this)
    }
    login = async (): Promise<Client> => {
        const me = await this.rest.api<APIClientUser>('GET', 'users/me')
        this.user = new ClientUser(this, {
            avatar_url: me.image_url,
            id: me.user_id,
            name: me.name,
        })
        await this.ws.init()
        return this
    }
    logout = async (): Promise<void> => {
        await this.ws.close()
    }
}
