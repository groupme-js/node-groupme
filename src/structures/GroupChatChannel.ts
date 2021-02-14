import ChatChannel from "./ChatChannel";
import Message from "./Message";
import User from "./User";

export default class GroupChatChannel implements ChatChannel {
    type: "group" = "group";
    id: string;
    messageCount: number;
    lastMessage: Message;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    phoneNumber: string;
    private: boolean;
    imageURL: string;
    creator: User;
    mutedUntil: Date;
    officeMode: boolean;
    inviteURL: string;
    inviteQR: string;
    members: User[] | null;
    maxMembers: number;
    theme: string | null;
    likeIcon: {
        type: "emoji",
        packId: number,
        packIndex: number
    } | null;
    requiresApproval: boolean;
    showJoinQuestion: boolean;
    joinQuestion: string | null;
    constructor(data: Omit<GroupChatChannel, "type">) {
        this.id = data.id;
        this.messageCount = data.messageCount;
        this.lastMessage = data.lastMessage;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.name = data.name;
        this.phoneNumber = data.phoneNumber;
        this.private = data.private;
        this.imageURL = data.imageURL;
        this.creator = data.creator;
        this.mutedUntil = data.mutedUntil;
        this.officeMode = data.officeMode;
        this.inviteURL = data.inviteURL;
        this.inviteQR = data.inviteQR;
        this.members = data.members;
        this.maxMembers = data.maxMembers;
        this.theme = data.theme;
        this.likeIcon = data.likeIcon;
        this.requiresApproval = data.requiresApproval;
        this.showJoinQuestion = data.showJoinQuestion;
        this.joinQuestion = data.joinQuestion;
    }
}