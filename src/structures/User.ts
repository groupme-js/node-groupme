export type UserData = {
    id: string,
    name: string,
    avatar: string,
}

export default class User {
    private readonly _id: string;
    public get id(): string {
        return this._id;
    }
    avatar: string;
    name: string;
    constructor(data: UserData) {
        this._id = data.id;
        this.avatar = data.avatar;
        this.name = data.name;
    }
}