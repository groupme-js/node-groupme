import type { APIGroup } from "groupme-api-types";
import { Client, Collection, FormerGroup, Member, User } from "..";
import BaseManager from "./BaseManager";

interface FormerGroupManagerInterface {
    client: Client
    cache: Collection<string, FormerGroup>
    fetch(): Promise<Collection<string, FormerGroup>>
}

export default class FormerGroupManager extends BaseManager<FormerGroup> implements FormerGroupManagerInterface {
    constructor(client: Client) {
        super(client, FormerGroup);
    }

    public async fetch(): Promise<Collection<string, FormerGroup>> {
        const groupsFormerResponse = await this.client.rest.api<APIGroup[]>("GET", "groups/former");
        const batch = new Collection<string, FormerGroup>();

        groupsFormerResponse.forEach(g => {
            /** The Group object to store data in. */
            const formerGroup = this._upsert(new FormerGroup(this.client, g));

            // we know that g.members is always defined for former groups
            // however, it would be nice if the types reflected that...
            g.members!.forEach(data => {
                const user = this.client.users._upsert(new User(this.client, {
                    id: data.user_id,
                    avatar: data.image_url,
                    name: data.name,
                }));
                formerGroup.members._upsert(new Member(this.client, formerGroup, user, data));
            });
            batch.set(formerGroup.id, formerGroup);
        });
        return batch;
    }
}