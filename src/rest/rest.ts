import fetch from "node-fetch";
import { Client } from "../client/Client";
import { Attachment } from "../structures/Attachment";
import { User } from "../structures/User";

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
    client: Client;
    constructor(client: Client) {
        this.client = client;
    }

    async _api<T>(path: string): Promise<T> {
        const url = "https://api.groupme.com/v3/" + path;
        const response = await fetch(url, {
            headers: { 'X-Access-Token': this.client.token }
        });
        // console.log(`-----\nAPI request\nurl: ${url}\n`, response, `\n-----`)
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await (response.json() as Promise<GroupMeAPIResponse<T>>);
        // console.log(data);
        if (data.meta.errors) {
            throw new Error(data.meta.errors.join('; '));
        }
        return data.response;
    }

    async fetchGroups() {
        const groups = await this._api<GroupsIndexResponse>("groups");

        groups.forEach(g => {
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

        });

        return this.client.groups.cache;
    }

    async fetchChats() {
        const chats = await this._api<ChatsIndexResponse>("chats");

        chats.forEach(c => {
            this.client.chats.add({
                client: this.client,
                createdAt: c.created_at,
                updatedAt: c.updated_at,
                id: c.last_message.conversation_id,
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