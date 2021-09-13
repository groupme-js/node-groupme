import { Convert as ConvertMe, Me } from "./Me";
import { Convert as ConvertChat, APIChat } from "./ChatsIndexResponse";
import { Convert as ConvertGroup, APIGroup, MemberResponse } from "./GroupResponse";
import { Convert as ConvertMembers, MembersIndexResponse, StatefulAPIMember } from "./GroupMembersIndexResponse";
const
    toMe = ConvertMe.toMe,
    toChats = ConvertChat.toChatsIndexResponse,
    toGroups = ConvertGroup.toGroupResponse,
    toMembers = ConvertMembers.toMembersIndexResponse
export {
    Me, toMe,
    APIChat, toChats,
    APIGroup, toGroups, MemberResponse as APIMember,
    MembersIndexResponse, toMembers, StatefulAPIMember,
}