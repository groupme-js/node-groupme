import type { BaseGroup, Client, Collection } from '..'
import { BaseManager, FormerMember } from '..'

interface FormerMemberManagerInterface {
    fetch(): Promise<Collection<string, FormerMember>>
}

export default class FormerMemberManager extends BaseManager<FormerMember> implements FormerMemberManagerInterface {
    group: BaseGroup
    constructor(client: Client, group: BaseGroup) {
        super(client, FormerMember)
        this.group = group
    }
    fetch(): Promise<Collection<string, FormerMember>> {
        throw new Error('Method not implemented.')
    }
}
