import type { APIGroup } from 'groupme-api-types'
import type { Client } from '..'
import { BaseManager, Collection, FormerGroup, Member } from '..'

interface FormerGroupManagerInterface {
    client: Client
    cache: Collection<string, FormerGroup>
    fetch(): Promise<Collection<string, FormerGroup>>
}

export default class FormerGroupManager
    extends BaseManager<FormerGroup, typeof FormerGroup>
    implements FormerGroupManagerInterface
{
    constructor(client: Client) {
        super(client, FormerGroup)
    }

    fetch(): Promise<Collection<string, FormerGroup>>
    fetch(id: string): Promise<FormerGroup>
    public async fetch(id?: string): Promise<Collection<string, FormerGroup> | FormerGroup> {
        const groupsFormerResponse = await this.client.rest.api<APIGroup[]>('GET', 'groups/former')
        const batch = new Collection<string, FormerGroup>()

        groupsFormerResponse.forEach(g => {
            /** The Group object to store data in. */
            const formerGroup = this._upsert(new FormerGroup(this.client, g))

            // we know that g.members is always defined for former groups
            // however, it would be nice if the types reflected that...
            g.members!.forEach(data => {
                const user = this.client.users._add({
                    id: data.user_id,
                    avatar_url: data.image_url,
                    name: data.name,
                })
                formerGroup.members._upsert(new Member(this.client, formerGroup, user, data))
            })
            batch.set(formerGroup.id, formerGroup)
        })
        return batch
    }
}
