import MemberManager from "../managers/MemberManager";
import { Channel } from "./Channel";

export type GroupData = Omit<Group, "type" | "members">

interface GroupInterface {

}

export class Group extends Channel implements GroupInterface {
    readonly type: "group" = "group";
    readonly members: MemberManager;
    name: string;
    phoneNumber: string | null;
    private: boolean;
    imageURL: string | null;
    creatorID: string;
    mutedUntil?: number | null;
    officeMode: boolean;
    inviteURL: string | null;
    inviteQR: string | null;
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
    constructor(data: GroupData) {
        super({
            id: data.id,
            type: "group",
            client: data.client,
            lastMessage: data.lastMessage,
            messageCount: data.messageCount,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            messageDeletionMode: data.messageDeletionMode,
            messageDeletionPeriod: data.messageDeletionPeriod,
        });
        this.members = new MemberManager(this.client, this);
        this.name = data.name;
        this.phoneNumber = data.phoneNumber;
        this.private = data.private;
        this.imageURL = data.imageURL;
        this.creatorID = data.creatorID;
        this.mutedUntil = data.mutedUntil;
        this.officeMode = data.officeMode;
        this.inviteURL = data.inviteURL;
        this.inviteQR = data.inviteQR;
        this.maxMembers = data.maxMembers;
        this.theme = data.theme;
        this.likeIcon = data.likeIcon;
        this.requiresApproval = data.requiresApproval;
        this.showJoinQuestion = data.showJoinQuestion;
        this.joinQuestion = data.joinQuestion;
    }
}