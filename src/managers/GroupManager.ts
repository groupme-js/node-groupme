import { Client, Collection } from "..";
import { GroupResponse, toGroups } from "../interfaces";
import { Group, GroupData } from "../structures/Group";
import tArray from "../util/tArray";
import BaseManager from "./BaseManager";

type GroupsRequestParams = {
    page?: number,
    per_page?: number,
    omit?: "memberships"
}

export default class GroupManager extends BaseManager {
    client: Client;
    cache: Collection<string, Group>;
    constructor(client: Client) {
        super();
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
        const groupsIndexResponse = await this.client.rest.api<GroupResponse[]>("GET", "groups", tArray(toGroups), { query: apiParams });
        groupsIndexResponse.forEach(g => {
            /** The Group object to store data in. */
            const group = this.client.groups.add({
                client: this.client,
                createdAt: g.created_at,
                creatorID: g.creator_user_id,
                id: g.id,
                imageURL: g.image_url,
                inviteQR: g.share_qr_code_url,
                inviteURL: g.share_url,
                joinQuestion: g.join_question,
                lastMessage: {
                    id: g.messages.last_message_id,
                    createdAt: g.messages.last_message_created_at,
                    text: g.messages.preview.text,
                    attachments: g.messages.preview.attachments,
                    user: {
                        image_url: g.messages.preview.image_url,
                        nickname: g.messages.preview.nickname,
                    }
                },
                likeIcon: g.like_icon ? {
                    packId: g.like_icon.pack_id,
                    packIndex: g.like_icon.pack_index,
                    type: "emoji"
                } : null,
                maxMembers: g.max_members,
                messageCount: g.messages.count,
                mutedUntil: g.muted_until,
                name: g.name,
                officeMode: g.office_mode,
                phoneNumber: g.phone_number,
                private: g.type == "private",
                requiresApproval: g.requires_approval,
                showJoinQuestion: g.show_join_question,
                theme: g.theme_name,
                updatedAt: g.updated_at,
                messageDeletionMode: g.message_deletion_mode,
                messageDeletionPeriod: g.message_deletion_period,
            });

            if (g.members) {
                g.members.forEach(m => {
                    const user = this.client.users.add({
                        id: m.user_id,
                        avatar: m.image_url,
                        name: m.name,
                    });
                    const memberData = {
                        group: group,
                        user: user,
                        memberID: m.id,
                        nickname: m.nickname,
                        autokicked: m.autokicked,
                        muted: m.muted,
                        roles: m.roles,
                    };
                    group.members.add(memberData);
                });
            }
            batch.set(group.id, group);
        });
        return batch;
    }
    
}