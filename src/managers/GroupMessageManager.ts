import { Client, Collection, Group } from "..";
import GroupMessage from "../structures/GroupMessage";
import MessageManager from "./MessageManager";

export default class GroupMessageManager extends MessageManager<Group, GroupMessage> {
    constructor(client: Client, channel: Group) {
        super(client, channel);
    }
    fetch(): Promise<Collection<string, GroupMessage>> {
        throw new Error("Method not implemented.");
    }
}