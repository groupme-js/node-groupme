import { User, UserData } from "../structures/User";

interface ClientUserInterface {
    
}

export class ClientUser extends User implements ClientUserInterface {
    constructor(data: UserData) {
        super(data)
    }
}