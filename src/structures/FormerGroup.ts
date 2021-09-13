import { Channel, Client, Group } from "..";
import { APIGroup } from "../interfaces";
import { ChannelType } from "./Channel";

interface FormerGroupInterface {
    rejoin(): Promise<Group>
}

export default class FormerGroup extends Channel implements FormerGroupInterface {
    readonly type = ChannelType.FormerGroup;
    // formergroup needs to share all properties with group EXCEPT sendable

    constructor(client: Client, data: APIGroup) {
        super({
            id: data.id,
            client: client,
            lastMessage: {
                id: data.messages.last_message_id,
                createdAt: data.messages.last_message_created_at,
                text: data.messages.preview.text,
                attachments: data.messages.preview.attachments,
                user: {
                    image_url: data.messages.preview.image_url,
                    nickname: data.messages.preview.nickname,
                }
            },
            messageCount: data.messages.count,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            messageDeletionMode: data.message_deletion_mode,
            messageDeletionPeriod: data.message_deletion_period,
        })
    }

    rejoin(): Promise<Group> {
        throw new Error("Method not implemented.");
    }
}