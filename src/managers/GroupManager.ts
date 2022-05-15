import type { APIGroup, PostGroupBody, PostGroupResponse, PostJoinGroupResponse } from 'groupme-api-types'
import { URL } from 'url'
import type { Client } from '..'
import { BaseManager, Collection, FormerGroupManager, Group, Member, User } from '..'

type GroupCreateOptions = {
    name: string
    type?: 'private' | 'closed'
    description?: string
    image_url?: string
    share?: boolean
    join_question?: string
    requires_approval?: boolean
    office_mode?: boolean
}

type GroupsRequestParams = {
    page?: number
    per_page?: number
    omit?: 'memberships'
}

type FetchParams = {
    page?: number
    per_page?: number
    /** Whether to omit membership data from the response.
     * Recommended if dealing with very large groups. Defaults to false. */
    omit_members?: boolean
}

interface GroupManagerInterface {
    client: Client
    cache: Collection<string, Group>
    former: FormerGroupManager
    create(options: GroupCreateOptions): Promise<Group>
    join(inviteLink: string): Promise<Group>
    join(groupID: string, shareToken: string): Promise<Group>
    fetch(): Promise<Collection<string, Group>>
    fetch(id: string): Promise<Group>
    fetch(ids: string[]): Promise<Collection<string, Group | null>>
    fetch(options: FetchParams): Promise<Collection<string, Group | null>>
}

export default class GroupManager extends BaseManager<Group> implements GroupManagerInterface {
    former: FormerGroupManager

    constructor(client: Client) {
        super(client, Group)
        this.former = new FormerGroupManager(client)
    }

    /**
     * Creates a group.
     *
     * @param options Options for creating a group.
     * @returns The created group.
     */
    create(options: GroupCreateOptions): Promise<Group>
    public async create(options: GroupCreateOptions): Promise<Group> {
        const body: PostGroupBody = { name: options.name }
        if (options.type !== undefined) body.type = options.type
        if (options.description !== undefined) body.description = options.description
        if (options.image_url !== undefined) body.image_url = options.description
        if (options.share !== undefined) body.share = options.share
        if (options.join_question !== undefined) {
            body.show_join_question = true
            body.join_question = { text: options.join_question, type: 'join_reason/questions/text' }
        }
        if (options.requires_approval !== undefined) body.requires_approval = options.requires_approval
        if (options.office_mode !== undefined) body.office_mode = options.office_mode
        const res = await this.client.rest.api<PostGroupResponse>('POST', 'groups', { body })
        const group = this._upsert(new Group(this.client, res))
        if (res.members) {
            res.members.forEach(data => {
                const user = this.client.users._upsert(
                    new User(this.client, {
                        id: data.user_id,
                        avatar: data.image_url,
                        name: data.name,
                    }),
                )
                group.members._upsert(new Member(this.client, group, user, data))
            })
        }
        return group
    }

    /**
     * Joins a group.
     *
     * @param inviteLinkOrGroupID The group invite link or group ID.
     * @param shareToken The group's share token.
     * @returns The joined group.
     */
    join(inviteLink: string): Promise<Group>
    join(groupID: string, shareToken: string): Promise<Group>
    public async join(inviteLinkOrGroupID: string, shareToken?: string): Promise<Group> {
        if (shareToken !== undefined) {
            return await this.joinWithToken(inviteLinkOrGroupID, shareToken)
        } else {
            const urlPath = new URL(inviteLinkOrGroupID).pathname
            const matches = urlPath.match(/.+\/(\d+)\/([A-Za-z0-9]+)$/)
            if (matches === null) throw new Error(`Invalid invite link\n-- URL: ${inviteLinkOrGroupID}`)
            return await this.joinWithToken(matches[1], matches[2])
        }
    }

    private async joinWithToken(groupID: string, shareToken: string): Promise<Group> {
        const res = await this.client.rest.api<PostJoinGroupResponse>('POST', `groups/${groupID}/join/${shareToken}`)
        const group = this._upsert(new Group(this.client, res.group))
        if (res.group.members) {
            res.group.members.forEach(data => {
                const user = this.client.users._upsert(
                    new User(this.client, {
                        id: data.user_id,
                        avatar: data.image_url,
                        name: data.name,
                    }),
                )
                group.members._upsert(new Member(this.client, group, user, data))
            })
        }
        return group
    }

    /**
     * Fetches groups from the API.
     *
     * By default, this method fetches all groups that the client is in.
     *
     * Use `options.page` and `options.per_page` to specify a paginated section of groups to fetch.
     * Pass in one or an array of string IDs to specify specific group IDs to fetch.
     *
     * @param options Options for fetching groups. All groups are fetched if `page` and `per_page` are omitted.
     * @returns A Collection of groups that were fetched, or `client.groups.cache` if all groups were fetched.
     */
    fetch(): Promise<Collection<string, Group>>
    fetch(id: string): Promise<Group>
    fetch(ids: string[]): Promise<Collection<string, Group | null>>
    fetch(options: FetchParams): Promise<Collection<string, Group | null>>
    public async fetch(
        options?: string | string[] | FetchParams,
    ): Promise<Group | Collection<string, Group> | Collection<string, Group | null>> {
        if (typeof options === 'string') {
            return await this.fetchId(options)
        } else if (options instanceof Array) {
            return await this.fetchIds(options)
        } else if (typeof options === 'object') {
            return await this.fetchIndex(options)
        } else {
            return await this.fetchAll()
        }
    }

    private async fetchId(id: string): Promise<Group> {
        const res = await this.client.rest.api<APIGroup>('GET', `groups/${id}`)
        const group = this._upsert(new Group(this.client, res))
        if (res.members) {
            res.members.forEach(data => {
                const user = this.client.users._upsert(
                    new User(this.client, {
                        id: data.user_id,
                        avatar: data.image_url,
                        name: data.name,
                    }),
                )
                group.members._upsert(new Member(this.client, group, user, data))
            })
        }
        return group
    }

    private async fetchIds(ids: string[]): Promise<Collection<string, Group | null>> {
        const batch = new Collection<string, Group>()
        await Promise.all(
            ids.map(async id => {
                const group = await this.fetchId(id)
                batch.set(group.id, group)
            }),
        )
        return batch
    }

    private async fetchIndex(options: FetchParams): Promise<Collection<string, Group | null>> {
        const apiParams: GroupsRequestParams = {}
        if (options.page !== undefined) apiParams.page = options.page
        if (options.per_page !== undefined) apiParams.per_page = options.per_page
        if (options.omit_members === true) apiParams.omit = 'memberships'

        const batch = new Collection<string, Group>()
        const groupsIndexResponse = await this.client.rest.api<APIGroup[]>('GET', 'groups', { query: apiParams })
        groupsIndexResponse.forEach(g => {
            /** The Group object to store data in. */
            const group = this._upsert(new Group(this.client, g))

            if (g.members) {
                g.members.forEach(data => {
                    const user = this.client.users._upsert(
                        new User(this.client, {
                            id: data.user_id,
                            avatar: data.image_url,
                            name: data.name,
                        }),
                    )
                    group.members._upsert(new Member(this.client, group, user, data))
                })
            }

            batch.set(group.id, group)
        })
        return batch
    }

    private async fetchAll(): Promise<Collection<string, Group | null>> {
        let batch,
            i = 1
        do {
            batch = await this.fetchIndex({
                page: i++,
                omit_members: false,
            })
        } while (batch.size)
        return this.client.groups.cache
    }
}
