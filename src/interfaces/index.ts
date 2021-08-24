import { Convert as ConvertMe, Me } from "./Me";
import { Convert as ConvertChat, ChatsIndexResponse } from "./ChatsIndexResponse";
import { Convert as ConvertGroup, GroupResponse } from "./GroupResponse";
const
    toMe = ConvertMe.toMe,
    toChats = ConvertChat.toChatsIndexResponse,
    toGroups = ConvertGroup.toGroupResponse
export {
    Me, toMe,
    ChatsIndexResponse, toChats,
    GroupResponse, toGroups,
}