import fetch from "node-fetch";
import { URL } from "url";
import { Channel, Chat, Client, Collection, Group, Member, Message, User } from "..";
import { Attachment } from "../structures/Attachment";

type GroupsRequestParams = {
    page?: number,
    per_page?: number,
    omit?: "memberships"
}

type GroupMeAPIResponse<T> = {
    response: T,
    meta: {
        code: number,
        errors: any[]
    }
};

type GroupsIndexResponse = {
    id: string,
    group_id: string,
    name: string,
    phone_number: string,
    type: string,
    description: string,
    image_url: string,
    creator_user_id: string,
    created_at: number,
    updated_at: number,
    muted_until: number,
    office_mode: boolean,
    share_url: string,
    share_qr_code_url: string,
    members: {
        user_id: string,
        nickname: string,
        image_url: string,
        id: string,
        muted: boolean,
        autokicked: boolean,
        roles: ["admin", "owner"] | ["admin"] | ["user"],
        name: string,
    }[] | null,
    messages: {
        count: number,
        last_message_id: string,
        last_message_created_at: number,
        preview: {
            nickname: string,
            text: string,
            image_url: string,
            attachments: Attachment[],
        }
    },
    max_members: number,
    theme_name: string | null,
    like_icon: {
        type: "emoji",
        packId: number,
        packIndex: number
    } | null;
    message_deletion_period: number,
    message_deletion_mode: string[],
    requires_approval: boolean,
    show_join_question: boolean,
    join_question: null // just pretend that this will never exist :clueless:
}[];

type ChatsIndexResponse = {
    created_at: number,
    updated_at: number,
    messages_count: number,
    message_deletion_period: number,
    message_deletion_mode: string[],
    last_message: {
        attachments: Attachment[],
        avatar_url: string,
        conversation_id: string,
        created_at: number,
        favorited_by: [], // This seems to always be empty
        id: string,
        name: string,
        recipient_id: string,
        sender_id: string,
        sender_type: string,
        source_guid: string,
        text: string,
        user_id: string,
    },
    other_user: {
        avatar_url: string,
        id: string,
        name: string,
    },
}[];


export default class RESTManager {
    static BASE_URL = "https://api.groupme.com/v3/"
    client: Client;
    constructor(client: Client) {
        this.client = client;
    }

    async _api<T>(path: string, options?: { [key: string]: any }): Promise<T> {
        const url = new URL(path, RESTManager.BASE_URL);
        if (options) {
            for (const key in options) {
                if (Object.prototype.hasOwnProperty.call(options, key)) {
                    const value = options[key];
                    url.searchParams.set(key, value);
                }
            }
        }
        const response = await fetch(url, {
            headers: { 'X-Access-Token': this.client.token }
        });
        console.log(`-----\nAPI request\nurl: ${url}\n-----`)
        const data = await (response.json() as Promise<GroupMeAPIResponse<T>>);
        // console.log(data);
        if (data.meta.errors) {
            throw new Error(`${data.meta.errors.join('; ')}\n-- Endpoint: ${url}\n-- Options: ${JSON.stringify(options, null, '    ')}`);
        }
        return data.response;
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
        const groupsIndexResponse = await this._api<GroupsIndexResponse>("groups", apiParams);
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
                likeIcon: g.like_icon,
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

    async fetchChats() {
        const chats = await this._api<ChatsIndexResponse>("chats");

        chats.forEach(c => {
            this.client.chats.add({
                client: this.client,
                createdAt: c.created_at,
                updatedAt: c.updated_at,
                id: c.other_user.id,
                conversation_id: c.last_message.conversation_id,
                recipient: this.client.users.add({
                    id: c.other_user.id,
                    name: c.other_user.name,
                    avatar: c.other_user.avatar_url,
                }),
                lastMessage: {
                    id: c.last_message.id,
                    attachments: c.last_message.attachments,
                    createdAt: c.last_message.created_at,
                    text: c.last_message.text,
                    user: {
                        nickname: c.last_message.name,
                        image_url: c.last_message.avatar_url,
                    },
                },
                messageCount: c.messages_count,
                messageDeletionMode: c.message_deletion_mode,
                messageDeletionPeriod: c.message_deletion_period,
            });
        });

        return this.client.chats.cache;
    }
}