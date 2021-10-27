import type { APIGroup } from "groupme-api-types";
import type { Client, FormerGroup, Member, Message, SendableChannelInterface } from "..";
import GroupMessageManager from "../managers/GroupMessageManager";
import PollManager from "../managers/PollManager";
import BaseGroup from "./BaseGroup";
import { ChannelType } from "./Channel";
import type GroupMessage from "./GroupMessage";

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
    send(message: Message): Promise<GroupMessage>
    leave(): Promise<FormerGroup>
    get canLeave(): boolean
    get canUpdate(): boolean
    get canDelete(): boolean
    get canTransfer(): boolean
    get canAddMembers(): boolean
    get canRemoveMembers(): boolean
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
    send(message: Message): Promise<GroupMessage> {
        throw new Error("Method not implemented.");
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
    get canLeave(): boolean {
        throw new Error("Method not implemented.");
    }
    get canUpdate(): boolean {
        throw new Error("Method not implemented.");
    }
    get canDelete(): boolean {
        throw new Error("Method not implemented.");
    }
    get canTransfer(): boolean {
        throw new Error("Method not implemented.");
    }
    get canAddMembers(): boolean {
        throw new Error("Method not implemented.");
    }
    get canRemoveMembers(): boolean {
        throw new Error("Method not implemented.");
    }

}