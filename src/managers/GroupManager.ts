import { Client } from "../client/Client";
import { Group, GroupData } from "../structures/Group";
import Collection from "../util/Collection";
import BaseManager from "./BaseManager";

export default class GroupManager implements BaseManager {
    client: Client;
    cache: Collection<string, Group>;
    constructor(client: Client) {
        this.client = client;
        this.cache = new Collection<string, Group>();
    }

    /**
     * Constructs a Group with the specified data and stores it in the cache.
     * If a Group with the specified ID already exists, updates the existing
     * Group with the given data.
     * @returns the created or modified Group
     */
    public add(groupData: GroupData): Group {
        const cachedGroup = this.cache.get(groupData.id);
        if (cachedGroup) {
            Object.assign(cachedGroup, groupData);
            return cachedGroup;
        }
        const group = new Group(groupData);
        this.cache.set(group.id, group);
        return group;
    }
}