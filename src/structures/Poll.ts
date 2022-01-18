import type { APIPoll } from "groupme-api-types";
import { Client, Collection, Group, User } from "..";
import type PollOption from "./PollOption";

interface PollInterface {
    fetch(): Promise<this>;
    vote(option: OptionID | PollOption): Promise<this>;
    vote(options: (OptionID | PollOption)[]): Promise<this>;
    end(): Promise<this>;
    get canEnd(): boolean;
}

type UserID = string;
type OptionID = string;

export default class Poll implements PollInterface {
    readonly client: Client;
    private _active: boolean;
    id: string;
    question: string;
    options: Collection<OptionID, PollOption>;
    voters?: Collection<UserID, OptionID> | Collection<UserID, OptionID[]>;
    myVote?: OptionID | OptionID[];
    group: Group;
    creator: User;
    multi: boolean;
    public: boolean;
    createdAt: number;
    updatedAt: number;
    expiresAt: number;

    constructor(client: Client, group: Group, creator: User, data: APIPoll) {
        this.client = client;
        this.id = data.data.id;
        this.question = data.data.subject;
        this.group = group;
        this.creator = creator;
        this._active = data.data.status == "active";
        this.multi = data.data.type == "multi";
        this.public = data.data.visibility == "public";
        this.createdAt = data.data.created_at;
        this.updatedAt = data.data.last_modified;
        this.expiresAt = data.data.expiration;
        this.options = new Collection<OptionID, PollOption>();
        this.voters = this.public
            ? this.multi
                ? new Collection<UserID, OptionID[]>()
                : new Collection<UserID, OptionID>()
            : undefined;
        this.myVote = this.multi ? data.user_votes : data.user_vote;
    }
    vote(option: string | PollOption): Promise<this>;
    vote(options: (string | PollOption)[]): Promise<this>;
    vote(
        options: string | PollOption | (string | PollOption)[]
    ): Promise<this> {
        throw new Error("Method not implemented.");
    }
    fetch(): Promise<this> {
        throw new Error("Method not implemented.");
    }
    end(): Promise<this> {
        throw new Error("Method not implemented.");
    }
    get canEnd(): boolean {
        throw new Error("Method not implemented.");
    }
    public get active(): boolean {
        throw new Error("Method not implemented.");
        if (this._active /* && (this.expiresAt has passed) */)
            this._active = false;
        return this._active;
    }
}
