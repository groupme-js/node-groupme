import type Client from '../client/Client'

export default abstract class Base {
    readonly client: Client
    readonly id: string
    constructor(client: Client, id: string) {
        this.client = client
        this.id = id
    }

    _clone() {
        return Object.assign(Object.create(this), this)
    }

    abstract _patch(data: any): this
}
