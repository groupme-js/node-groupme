export type UserData = {
    id: string;
    name: string;
    avatar: string | null;
};

interface UserInterface {}

export default class User implements UserInterface {
    private readonly _id: string;
    public get id(): string {
        return this._id;
    }
    avatar: string | null;
    name: string;
    constructor(data: UserData) {
        this._id = data.id;
        this.avatar = data.avatar;
        this.name = data.name;
    }
}
