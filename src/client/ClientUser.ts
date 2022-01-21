import type { Client } from ".."
import User, { UserData } from "../structures/User"

interface ClientUserInterface {}

export default class ClientUser extends User implements ClientUserInterface {
    constructor(client: Client, data: UserData) {
        super(client, data)
    }
}
