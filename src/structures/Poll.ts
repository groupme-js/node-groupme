import type { APIPoll } from 'groupme-api-types'
import type { Client, Group, User } from '..'
import { Base, Collection, PollOption } from '..'

interface PollInterface {
    fetch(): Promise<this>
    vote(option: OptionID | PollOption): Promise<this>
    vote(options: (OptionID | PollOption)[]): Promise<this>
    end(): Promise<this>
    get canEnd(): boolean
}

type UserID = string
type OptionID = string

export default class Poll extends Base implements PollInterface {
    private _active: boolean
    question: string
    options: Collection<OptionID, PollOption>
    voters?: Collection<UserID, OptionID> | Collection<UserID, OptionID[]>
    myVote?: OptionID | OptionID[]
    group: Group
    creator: User
    multi: boolean
    public: boolean
    createdAt: number
    updatedAt: number
    expiresAt: number

    constructor(client: Client, group: Group, creator: User, data: APIPoll) {
        super(client, data.data.id)
        this.question = data.data.subject
        this.group = group
        this.creator = creator
        this._active = data.data.status == 'active'
        this.multi = data.data.type == 'multi'
        this.public = data.data.visibility == 'public'
        this.createdAt = data.data.created_at
        this.updatedAt = data.data.last_modified
        this.expiresAt = data.data.expiration
        this.options = new Collection<OptionID, PollOption>()
        data.data.options.forEach(option => {
            this.options.set(option.id, new PollOption(this, option))
        })
        this.voters = this.public
            ? this.multi
                ? new Collection<UserID, OptionID[]>()
                : new Collection<UserID, OptionID>()
            : undefined
        this.myVote = this.multi ? data.user_votes : data.user_vote
    }
    _patch(data: Partial<APIPoll>): this {
        if (data.data?.subject !== undefined) this.question = data.data.subject
        if (data.data?.status !== undefined) this._active = data.data.status == 'active'
        if (data.data?.type !== undefined) this.multi = data.data.type == 'multi'
        if (data.data?.visibility !== undefined) this.public = data.data.visibility == 'public'
        if (data.data?.created_at !== undefined) this.createdAt = data.data.created_at
        if (data.data?.last_modified !== undefined) this.updatedAt = data.data.last_modified
        if (data.data?.expiration !== undefined) this.expiresAt = data.data.expiration

        this.myVote = this.multi ? data.user_votes : data.user_vote

        return this
    }

    vote(option: string | PollOption): Promise<this>
    vote(options: (string | PollOption)[]): Promise<this>
    vote(options: string | PollOption | (string | PollOption)[]): Promise<this> {
        throw new Error('Method not implemented.')
    }
    fetch(): Promise<this> {
        throw new Error('Method not implemented.')
    }
    end(): Promise<this> {
        throw new Error('Method not implemented.')
    }
    get canEnd(): boolean {
        throw new Error('Method not implemented.')
    }
    public get active(): boolean {
        throw new Error('Method not implemented.')
        if (this._active /* && (this.expiresAt has passed) */) this._active = false
        return this._active
    }
}
