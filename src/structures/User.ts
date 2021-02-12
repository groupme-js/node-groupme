type UserData = {
    id: string;
    avatar?: string;
};

export default class User {
    id: string;
    avatar?: string;
    constructor(data: UserData) {
        this.id = data.id;
        this.avatar = data.avatar;
    }
}