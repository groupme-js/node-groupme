import { Client, Collection, Group, Member, User } from "..";
import { APIGroup, toGroups } from "../interfaces";
import tArray from "../util/tArray";
import BaseManager from "./BaseManager";

type GroupsRequestParams = {
    page?: number,
    per_page?: number,
    omit?: "memberships"
}

type FetchParams = {
    page?: number,
    per_page?: number,
    /** Whether to omit membership data from the response. 
     * Recommended if dealing with very large groups. Defaults to false. */
    omit_members?: boolean,
}

interface GroupManagerInterface {
    client: Client
    cache: Collection<string, Group>
    fetch(): Promise<Collection<string, Group>>
    fetch(id: string): Promise<Group>
    fetch(ids: string[]): Promise<Collection<string, Group | null>>
    fetch(options: FetchParams): Promise<Collection<string, Group | null>>
}

export default class GroupManager extends BaseManager<Group> implements GroupManagerInterface {
    constructor(client: Client) {
        super(client);
    }

    /**
     * Fetches groups from the API. 
     * 
     * By default, this method fetches all groups that the client is in. 
     * 
     * Use `options.page` and `options.per_page` to specify a paginated section of groups to fetch.
     * Pass in one or an array of string IDs to specify specific group IDs to fetch.
     * 
     * @param options Options for fetching groups. All groups are fetched if `page` and `per_page` are omitted.
     * @returns A Collection of groups that were fetched, or `client.groups.cache` if all groups were fetched.
     */
    fetch(): Promise<Collection<string, Group>>;
    fetch(id: string): Promise<Group>;
    fetch(ids: string[]): Promise<Collection<string, Group | null>>;
    fetch(options: {
        page?: number,
        per_page?: number,
        /** Whether to omit membership data from the response. 
         * Recommended if dealing with very large groups. Defaults to false. */
        omit_members?: boolean,
    }): Promise<Collection<string, Group | null>>;
    public async fetch(options?: string | string[] | FetchParams): Promise<Group | Collection<string, Group> | Collection<string, Group | null>> {
        if (typeof options === 'string') {
            return await this.fetchId(options);
        } else if (options instanceof Array) {
            return await this.fetchIds(options);
        } else if (typeof options === 'object') {
            return await this.fetchIndex(options);
        } else {
            return await this.fetchAll();
        }
    }

    private async fetchId(id: string): Promise<Group> {
        let res = await this.client.rest.api<APIGroup>(
            "GET",
            `groups/${id}`,
            toGroups
        );
        const group = this._upsert(new Group(this.client, res));
        if (res.members) {
            res.members.forEach((data: any) => {
                const user = this.client.users._upsert(
                    new User({
                        id: data.user_id,
                        avatar: data.image_url,
                        name: data.name,
                    })
                );
                group.members._upsert(new Member(this.client, group, user, data));
            });
        }
        return group;
    }

    private async fetchIds(ids: string[]): Promise<Collection<string, Group | null>> {
        let groups: any = [];
        for (const id of ids) {
            let curr = await this.client.rest.api<APIGroup>(
                "GET",
                `groups/${id}`,
                toGroups
            );
            groups.push(curr);
        }
        const batch = new Collection<string, Group>();
        groups.forEach((g: any) => {
            const group = this._upsert(new Group(this.client, g));

            if (g.members) {
                g.members.forEach((data: any) => {
                    const user = this.client.users._upsert(
                        new User({
                            id: data.user_id,
                            avatar: data.image_url,
                            name: data.name,
                        })
                    );
                    group.members._upsert(new Member(this.client, group, user, data));
                });
            }
            batch.set(group.id, group);
        });
        return batch;
    }

    private async fetchIndex(options: FetchParams): Promise<Collection<string, Group | null>> {
        const apiParams: GroupsRequestParams = {};
        if (options.page !== undefined) apiParams.page = options.page;
        if (options.per_page !== undefined) apiParams.per_page = options.per_page;
        if (options.omit_members === true) apiParams.omit = "memberships";

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

    private async fetchAll(): Promise<Collection<string, Group | null>> {
        let batch, i = 1;
        do {
            batch = await this.fetchIndex({
            page: i++,
            omit_members: false,
            });
        } while (batch.size);
        return this.client.groups.cache;
    }
}