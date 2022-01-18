import type { APIGroupMessage } from 'groupme-api-types';
import type { Client, Group } from '..';
import { Message } from '..';

interface GroupMessageInterface {

}

export default class GroupMessage extends Message implements GroupMessageInterface {
    constructor(client: Client, group: Group, data: APIGroupMessage) {
        super(client, group, data);
    }
}