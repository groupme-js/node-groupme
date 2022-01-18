import User, { UserData } from "../structures/User";

interface ClientUserInterface {}

export default class ClientUser extends User implements ClientUserInterface {
    constructor(data: UserData) {
        super(data);
    }
}
