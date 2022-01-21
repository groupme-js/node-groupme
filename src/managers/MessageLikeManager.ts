import { UserManager } from ".."

interface MessageLikeManagerInterface {
    get mine(): boolean
}

export default class MessageLikeManager extends UserManager implements MessageLikeManagerInterface {
    public get mine(): boolean {
        return this.cache.has(this.client.user.id)
    }
}
