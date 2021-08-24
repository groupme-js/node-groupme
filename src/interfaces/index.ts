import { Convert as ConvertMe, Me } from "./Me";
import { Convert as ConvertChat, ChatsIndexResponse } from "./ChatsIndexResponse";
import { Convert as ConvertGroup, GroupsIndexResponse } from "./GroupsIndexResponse";
const
    toMe = ConvertMe.toMe,
    toChats = ConvertChat.toChatsIndexResponse,
    toGroups = ConvertGroup.toGroupsIndexResponse
export {
    Me, toMe,
    ChatsIndexResponse, toChats,
    GroupsIndexResponse, toGroups,
}