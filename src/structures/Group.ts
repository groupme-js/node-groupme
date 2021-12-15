import type { APIGroup, PostGroupMessageBody, PostGroupMessageResponse } from "groupme-api-types";
import type { Client, FormerGroup, Member, Message, SendableChannelInterface } from "..";
import GroupMessageManager from "../managers/GroupMessageManager";
import PollManager from "../managers/PollManager";
import BaseGroup from "./BaseGroup";
import { ChannelType } from "./Channel";
import GroupMessage from "./GroupMessage";

type GroupUpdateOptions = {
    name: string
    description: string
    image_url: string
    share: boolean
    office_mode: boolean
}

interface ActiveGroupInterface {
    fetch(): Promise<this>
    update(options: GroupUpdateOptions): Promise<this>
    transferOwnershipTo(newOwner: string): Promise<this>
    delete(): Promise<void>
    changeNickname(nickname: string): Promise<Member>
    send(text: string): Promise<GroupMessage>
    leave(): Promise<FormerGroup>
}

export default class Group extends BaseGroup implements ActiveGroupInterface, SendableChannelInterface {
    readonly type = ChannelType.Group;
    readonly messages: GroupMessageManager;
    readonly polls: PollManager;
    constructor(client: Client, data: APIGroup) {
        super(client, data);
        this.messages = new GroupMessageManager(client, this);
        this.polls = new PollManager(client, this);
    }

    public async send(text: string): Promise<GroupMessage> {
        const body: PostGroupMessageBody = {
            message: {
                text,
                attachments: [],
                source_guid: this.client.rest.guid(),
            }
        };
        const response = await this.client.rest.api<PostGroupMessageResponse>(
            'POST',
            `groups/${this.id}/messages`,
            { body },
        );
        const message = new GroupMessage(this.client, this, response.message);
        return this.messages._upsert(message);
    }

    fetch(): Promise<this> {
        throw new Error("Method not implemented.");
    }

    update(options: GroupUpdateOptions): Promise<this> {
        throw new Error("Method not implemented.");
    }

    transferOwnershipTo(newOwner: string): Promise<this> {
        throw new Error("Method not implemented.");
    }

    delete(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    changeNickname(nickname: string): Promise<Member> {
        throw new Error("Method not implemented.");
    }

    leave(): Promise<FormerGroup> {
        throw new Error("Method not implemented.");
    }

    }

}