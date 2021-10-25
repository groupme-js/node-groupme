import { Client, Group, Member, User } from "..";
import type { APIMember } from "../interfaces";

enum State {
    Exited = "exited",
    ExitedRemoved = "exited_removed",
    Removed = "removed",
}

interface FormerMemberInterface {
    ban(): Promise<this>
    rejoin(): Promise<this>
}

export default class FormerMember extends Member implements FormerMemberInterface {
    state: State;
    constructor(client: Client, group: Group, user: User, data: APIMember, state: State) {
        super(client, group, user, data);
        this.state = state;
    }
    ban(): Promise<this> {
        throw new Error("Method not implemented.");
    }
    rejoin(): Promise<this> {
        throw new Error("Method not implemented.");
    }
}