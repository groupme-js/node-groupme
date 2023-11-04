import type { Base, Client } from '../../..'
import type BaseManager from '../../../managers/BaseManager'

async function getThing<T extends Base, TCtor extends new (...args: any[]) => T>(
    client: Client,
    id: string | number,
    manager: BaseManager<T, TCtor>,
    partialType: keyof Client['options']['fetchPartials'],
): Promise<T | undefined> {
    let thing = manager.cache.get(String(id))
    if (!thing && client.options.fetchPartials[partialType]) thing = await manager.fetch(String(id))
    return thing
}

export async function getGroup(client: Client, id: string | number) {
    return getThing(client, id, client.groups, 'group')
}

export async function getUser(client: Client, id: string | number) {
    return getThing(client, id, client.users, 'user')
}

export async function getMember(client: Client, groupID: string | number, userID: string | number) {
    const group = await getGroup(client, groupID)
    if (!group) return
    return getThing(client, userID, group.members, 'member')
}
