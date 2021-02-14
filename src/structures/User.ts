export default class User {
    id: string;
    avatar: string;
    name?: string;
    constructor(data: User) {
        this.id = data.id;
        this.avatar = data.avatar;
        this.name = data.name;
    }
}