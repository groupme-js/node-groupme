import type { APIUser } from 'groupme-api-types'
import type { Client } from '..'
import { User } from '..'

interface ClientUserInterface {}

export default class ClientUser extends User implements ClientUserInterface {
    constructor(client: Client, data: APIUser) {
        super(client, data)
    }
}
