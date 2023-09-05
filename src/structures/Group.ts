import type {
    APIGroup,
    PostGroupMessageBody,
    PostGroupMessageResponse,
    PatchGroupBody,
    PatchGroupResponse,
    PostChangeOwnersBody,
    PostChangeOwnersResponse,
    DeleteGroupResponse,
} from 'groupme-api-types'
import type { Client, FormerGroup, Member, SendableChannelInterface } from '..'
import { BaseGroup, ChannelType, GroupMessage, GroupMessageManager, PollManager } from '..'

type GroupUpdateOptions = {
    name: string
    description: string
    image_url: string
    share: boolean
    office_mode: boolean
}

interface ActiveGroupInterface {
    fetch(): Promise<Group>
    update(options: GroupUpdateOptions): Promise<Group>
    transferOwnershipTo(newOwner: string): Promise<Group>
    delete(): Promise<void>
    changeNickname(nickname: string): Promise<Member>
    send(text: string): Promise<GroupMessage>
    leave(): Promise<FormerGroup>
}

export default class Group extends BaseGroup implements ActiveGroupInterface, SendableChannelInterface {
    readonly type = ChannelType.Group
    readonly messages: GroupMessageManager
    readonly polls: PollManager
    constructor(client: Client, data: APIGroup) {
        super(client, data)
        this.messages = new GroupMessageManager(client, this)
        this.polls = new PollManager(client, this)
    }

    public async send(text: string): Promise<GroupMessage> {
        const body: PostGroupMessageBody = {
            message: {
                text,
                attachments: [],
                source_guid: this.client.rest.guid(),
            },
        }
        const response = await this.client.rest.api<PostGroupMessageResponse>('POST', `groups/${this.id}/messages`, {
            body,
        })
        const message = new GroupMessage(this.client, this, response.message)
        return this.messages._upsert(message)
    }

    fetch(): Promise<Group> {
        return this.client.groups.fetch(this.id)
    }

    async update(options: GroupUpdateOptions): Promise<Group> {
        const body: PatchGroupBody = options
        const response = await this.client.rest.api<PatchGroupResponse>('POST', `groups/${this.id}/update`, { body })
        const group = new Group(this.client, response)
        return this.client.groups._upsert(group)
    }

    async transferOwnershipTo(newOwner: string): Promise<Group> {
        const body: PostChangeOwnersBody = {
            requests: [
                {
                    group_id: this.id,
                    owner_id: newOwner,
                },
            ],
        }
        const response = await this.client.rest.api<PostChangeOwnersResponse>('POST', 'groups/change_owners', { body })
        const status = response.results[0].status
        let errorMessage = ''
        switch (status) {
            case '200':
                return this.fetch()
            case '400':
                errorMessage = 'You cannot transfer a group to yourself.'
                break
            case '403':
                errorMessage = 'You cannot transfer a group you do not own.'
                break
            case '404':
                errorMessage = 'Group not found, or new owner is not a member of the group.'
                break
            case '405':
                errorMessage =
                    'Invalid request; Request object is missing a required field, or one of the required fields is not an ID.'
                break
            default:
                errorMessage =
                    "Idk what this status code means, but it's probably an error. It wasn't on the docs and I've never seen it before. Please report this to the developers of node-groupme and/or the GroupMe API!"
                break
        }
        const err = {
            statusCode: status,
            message: errorMessage,
            groupId: this.id,
            groupName: this.name,
            newOwner: newOwner,
        }
        throw err // Failed to transfer group, see error details
    }

    public async delete(): Promise<void> {
        await this.client.rest.api<DeleteGroupResponse>('POST', `groups/${this.id}/destroy`)
    }

    changeNickname(nickname: string): Promise<Member> {
        throw new Error('Method not implemented.')
    }

    leave(): Promise<FormerGroup> {
        throw new Error('Method not implemented.')
    }

    public get me(): Member | undefined {
        return this.members.cache.get(this.client.user.id)
    }
}
