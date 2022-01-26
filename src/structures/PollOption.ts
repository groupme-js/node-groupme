import type { PollOptionData } from "groupme-api-types"
import type { Poll, User } from ".."
import { Collection } from ".."

interface PollOptionInterface {
    vote(): Promise<this>
}

export default class PollOption implements PollOptionInterface {
    readonly poll: Poll
    id: string
    title: string
    votes: number
    voters: Collection<string, User>
    constructor(poll: Poll, data: PollOptionData) {
        this.poll = poll
        this.id = data.id
        this.title = data.title
        this.votes = data.votes ? data.votes : 0
        this.voters = new Collection<string, User>()
    }
    vote(): Promise<this> {
        throw new Error("Method not implemented.")
    }
}
