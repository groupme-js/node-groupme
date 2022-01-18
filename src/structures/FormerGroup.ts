import type { APIGroup } from "groupme-api-types";
import type { Client, Group } from "..";
import BaseGroup from "./BaseGroup";
import { ChannelType } from "./Channel";

interface FormerGroupInterface {
    rejoin(): Promise<Group>
}

export default class FormerGroup extends BaseGroup implements FormerGroupInterface {
    readonly type = ChannelType.FormerGroup;
    // formergroup needs to share all properties with group EXCEPT sendable

    constructor(client: Client, data: APIGroup) {
        super(client, data);
    }

    rejoin(): Promise<Group> {
        throw new Error("Method not implemented.");
    }
}