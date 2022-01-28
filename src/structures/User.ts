import type { Client } from '..'

export type UserData = {
    id: string
    name: string
    avatar: string | null
}

interface UserInterface {}

export default class User implements UserInterface {
    private readonly _id: string
    public get id(): string {
        return this._id
    }
    avatar: string | null
    name: string
    client: Client
    constructor(client: Client, data: UserData) {
        this.client = client
        this._id = data.id
        this.avatar = data.avatar
        this.name = data.name
    }
}
