import type { Client, Collection, Group } from "..";
import type GroupMessage from "../structures/GroupMessage";
import MessageManager, { MessageRequestParams } from "./MessageManager";

interface GroupMessageManagerInterface {
    client: Client
    channel: Group
    cache: Collection<string, GroupMessage>
    fetch(): Promise<Collection<string, GroupMessage>>
    fetch(id: string): Promise<GroupMessage>
    fetch(ids: string[]): Promise<Collection<string, GroupMessage>>
    fetch(options: MessageRequestParams): Promise<Collection<string, GroupMessage>>
}

export default class GroupMessageManager extends MessageManager<Group, GroupMessage> implements GroupMessageManagerInterface {
    constructor(client: Client, channel: Group) {
        super(client, channel);
    }
    
    fetch(): Promise<Collection<string, GroupMessage>>;
    fetch(id: string): Promise<GroupMessage>;
    fetch(ids: string[]): Promise<Collection<string, GroupMessage>>;
    fetch(options: MessageRequestParams): Promise<Collection<string, GroupMessage>>;
    fetch(options?: any): Promise<Collection<string, GroupMessage>> | Promise<GroupMessage> {
        throw new Error("Method not implemented.");
    }
}