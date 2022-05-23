import type { PollOptionData } from 'groupme-api-types'
import type { Poll } from '..'
import { Base } from '..'

interface PollOptionInterface {
    vote(): Promise<this>
}

export default class PollOption extends Base implements PollOptionInterface {
    readonly poll: Poll
    title: string
    votes: number
    voters?: string[]
    constructor(poll: Poll, data: PollOptionData) {
        super(poll.client, data.id)
        this.poll = poll
        this.title = data.title
        this.votes = data.votes ? data.votes : 0
        this.voters = data.voter_ids
    }
    _patch(data: Partial<PollOptionData>): this {
        if (data.title !== undefined) this.title = data.title
        if (data.votes !== undefined) this.votes = data.votes
        this.voters = data.voter_ids

        return this
    }
    vote(): Promise<this> {
        throw new Error('Method not implemented.')
    }
}
