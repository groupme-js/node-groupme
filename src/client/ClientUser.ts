import { User, UserData } from "../structures/User";

export class ClientUser extends User {
    constructor(data: UserData) {
        super(data)
    }
}