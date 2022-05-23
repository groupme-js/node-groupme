import type { Chat } from '..'
import { Message } from '..'

interface ChatMessageInterface {}

export default class ChatMessage extends Message<Chat> implements ChatMessageInterface {}
