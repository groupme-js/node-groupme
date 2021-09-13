import { Client, Collection, Group, Member, User } from "..";
import { APIGroup, toGroups } from "../interfaces";
import tArray from "../util/tArray";
import BaseManager from "./BaseManager";

type GroupsRequestParams = {
    page?: number,
    per_page?: number,
    omit?: "memberships"
}

interface GroupManagerInterface {
    client: Client
    cache: Collection<string, Group>
    fetch(): Promise<Collection<string, Group>>
    fetch(id: string): Promise<Group>
    fetch(ids: string[]): Promise<Collection<string, Group | null>>
}

export default class GroupManager extends BaseManager<Group> implements GroupManagerInterface {
    constructor(client: Client) {
        super(client);
    }

    fetch(): Promise<Collection<string, Group>>;
    fetch(id: string): Promise<Group>;
    fetch(ids: string[]): Promise<Collection<string, Group | null>>;
    public async fetch(ids?: string | string[]): Promise<Group | Collection<string, Group> | Collection<string, Group | null>> {
        throw new Error("Method not implemented.");
    }

    /**
     * Fetches groups from the API. 
     * 
     * By default, this method fetches all groups that the client is in. 
     * Use `options.page` and `options.per_page` to specify a paginated section of groups to fetch.
     * 
     * @param options Options for fetching groups. All groups are fetched if `page` and `per_page` are omitted.
     * @returns A Collection of groups that were fetched, or `client.groups.cache` if all groups were fetched.
     */
    async fetchGroups(options?: {
        page?: number,
        per_page?: number,
        /** Whether to omit membership data from the response. 
         * Recommended if dealing with very large groups. Defaults to false. */
        omit_members?: boolean,
    }) {
        const apiParams: GroupsRequestParams = {};
        if (options) {
            // If no pagination is specified, recursively fetch all groups
            if (options.page === undefined && options.per_page === undefined) {
                let batch, i = 1;
                do batch = await this.fetchGroups({ page: i++, omit_members: options.omit_members });
                while (batch.size);
                return this.client.groups.cache;
            }
            // Translate the options into valid API parameters
            if (options.page != undefined) apiParams.page = options.page;
            if (options.per_page != undefined) apiParams.per_page = options.per_page;
            if (options.omit_members == true) apiParams.omit = "memberships";
        }

        const batch = new Collection<string, Group>()
        const groupsIndexResponse = await this.client.rest.api<APIGroup[]>("GET", "groups", tArray(toGroups), { query: apiParams });
        groupsIndexResponse.forEach(g => {
            /** The Group object to store data in. */
            const group = this._upsert(new Group(this.client, g));

            if (g.members) {
                g.members.forEach(data => {
                    const user = this.client.users._upsert(new User({
                        id: data.user_id,
                        avatar: data.image_url,
                        name: data.name,
                    }));
                    group.members._upsert(new Member(this.client, group, user, data));
                });
            }

            batch.set(group.id, group);
        });
        return batch;
    }

}