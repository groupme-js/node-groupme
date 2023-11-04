import type { Client } from '../..'
import { favorite } from './favorite'
import { likeCreate } from './like.create'
import { lineCreate } from './line.create'
import { ping } from './ping'
import { subscribe } from './subscribe'
import { typing } from './typing'

const fnMap: {
    [key: string]: (client: Client, message: any) => Promise<void>
} = {
    favorite,
    ping,
    subscribe,
    typing,
    'like.create': likeCreate,
    'line.create': lineCreate,
}

export default fnMap
