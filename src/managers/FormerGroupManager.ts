import { Client, Collection, FormerGroup, Member, User } from "..";
import { APIGroup, toGroups } from "../interfaces";
import BaseManager from "./BaseManager";

interface FormerGroupManagerInterface {
    client: Client
    cache: Collection<string, FormerGroup>
    fetch(): Promise<Collection<string, FormerGroup>>
}

export default class FormerGroupManager extends BaseManager<FormerGroup> implements FormerGroupManagerInterface {
    constructor(client: Client) {
        super(client);
    }

    public async fetch(): Promise<Collection<string, FormerGroup>> {
        const groupsFormerResponse = await this.client.rest.api<APIGroup[]>("GET", "groups/former", toGroups);
        const batch = new Collection<string, FormerGroup>();

        groupsFormerResponse.forEach(g => {
            /** The Group object to store data in. */
            const formerGroup = this._upsert(new FormerGroup(this.client, g));
            g.members.forEach(data => {
                const user = this.client.users._upsert(new User({
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