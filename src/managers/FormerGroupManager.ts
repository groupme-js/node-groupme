import { Client, Collection, FormerGroup } from "..";
import BaseManager from "./BaseManager";

interface FormerGroupManagerInterface {
    client: Client
    cache: Collection<string, FormerGroup>
    fetch(): Promise<Collection<string, FormerGroup>>
}

export default class FormerGroupManager extends BaseManager<FormerGroup> implements FormerGroupManagerInterface {
    constructor(client: Client) {
        super(client);
    }

    public async fetch(): Promise<Collection<string, FormerGroup>> {
        throw new Error("Method not implemented.");
    }
}