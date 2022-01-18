import type { Client, Collection, Group } from "..";
import type Poll from "../structures/Poll";
import BaseManager from "./BaseManager";

interface PollManagerInterface {
    fetch(): Promise<Collection<string, Poll>>;
    fetch(id: string): Promise<Poll>;
    create(
        question: string,
        options: string[],
        settings?: {
            duration?: number;
            endAt?: Date;
            public?: boolean;
            allowMultipleResponses?: boolean;
        }
    ): Promise<Poll>;
}

export default class PollManager
    extends BaseManager<Poll>
    implements PollManagerInterface
{
    readonly group: Group;
    constructor(client: Client, group: Group) {
        super(client);
        this.group = group;
    }
    create(
        question: string,
        options: string[],
        settings?: {
            duration?: number;
            endAt?: Date;
            public?: boolean;
            allowMultipleResponses?: boolean;
        }
    ): Promise<Poll> {
        throw new Error("Method not implemented.");
    }
    fetch(): Promise<Collection<string, Poll>>;
    fetch(id: string): Promise<Poll>;
    fetch(id?: string): Promise<Collection<string, Poll> | Poll> {
        throw new Error("Method not implemented.");
    }
}
