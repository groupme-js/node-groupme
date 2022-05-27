import type { GetRelationshipsQuery, GetRelationshipsResponse } from 'groupme-api-types/v4'
import type { Client, Collection } from '..'
import { BaseManager, Relationship } from '..'

export default class RelationshipManager extends BaseManager<Relationship, typeof Relationship> {
    constructor(client: Client) {
        super(client, Relationship)
    }

    async fetch(includeBlocked = true): Promise<Collection<string, Relationship>> {
        const query: GetRelationshipsQuery = { include_blocked: includeBlocked }
        let response: GetRelationshipsResponse
        do {
            response = await this.client.rest.api<GetRelationshipsResponse>(
                'GET',
                'relationships',
                { query },
                { version: 'v4' },
            )
            response.forEach(data => this._upsert(new Relationship(this.client, data)))
            query.since = response[response.length - 1]?.updated_at_iso8601
        } while (response.length)
        return this.cache
    }
}
