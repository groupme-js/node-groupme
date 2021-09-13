import { Client, Collection } from "..";
import BaseGroup from "../structures/BaseGroup";
import FormerMember from "../structures/FormerMember";
import BaseManager from "./BaseManager";

interface FormerMemberManagerInterface {
    fetch(): Promise<Collection<string, FormerMember>>
}

export default class FormerMemberManager extends BaseManager<FormerMember> implements FormerMemberManagerInterface {
    group: BaseGroup;
    constructor(client: Client, group: BaseGroup) {
        super(client);
        this.group = group;
    }
    fetch(): Promise<Collection<string, FormerMember>> {
        throw new Error("Method not implemented.");
    }
}