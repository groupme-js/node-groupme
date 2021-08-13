import fetch from "node-fetch";
import { Client } from "../client/Client";
import { Attachment } from "../structures/Attachment";

type GroupMeAPIResponse<T> = {
    response: T,
    meta: {
        code: number,
        errors: any[]
    }
}

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
    requires_approval: boolean,
    show_join_question: boolean,
    join_question: null // just pretend that this will never exist :clueless:
}[];

async function api<T>(path: string): Promise<T> {
    const url = "https://api.groupme.com/v3" + path;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    const data = await (response.json() as Promise<GroupMeAPIResponse<T>>);
    if (data.meta.errors.length > 0) {
        throw new Error(data.meta.errors.join('; '));
    }
    return data.response;
}

export default class RESTManager {
    client: Client;
    constructor(client: Client) {
        this.client = client;
    }

    fetchGroups() {
        return api<GroupsIndexResponse>("groups").then(groups => {
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
                    updatedAt: g.updated_at
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
        });
    }

    fetchChats() {

    }
}