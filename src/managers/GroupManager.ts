import Client from "client/Client";
import Group, { GroupData } from "structures/Group";
import Collection from "util/Collection";
import BaseManager from "./BaseManager";

export default class GroupManager implements BaseManager {
    client: Client;
    cache: Collection<string, Group>;
    constructor(client: Client) {
        this.client = client;
        this.cache = new Collection<string, Group>();
    }

    /**
     * Constructs a Member with the specified data and stores it in the cache.
     * If a Member with the specified ID already exists, updates the existing
     * Member with the given data.
     * @returns the created or modified Member
     */
    public add(groupData: GroupData): Group {
        let group: Group;
        const cachedGroup = this.cache.get(groupData.id);
        if (cachedGroup) {
            cachedGroup.createdAt = groupData.createdAt;
            cachedGroup.creatorID = groupData.creatorID;
            cachedGroup.imageURL = groupData.imageURL;
            cachedGroup.inviteQR = groupData.inviteQR;
            cachedGroup.inviteURL = groupData.inviteURL;
            cachedGroup.joinQuestion = groupData.joinQuestion;
            cachedGroup.lastMessage = groupData.lastMessage;
            cachedGroup.likeIcon = groupData.likeIcon;
            cachedGroup.maxMembers = groupData.maxMembers;
            cachedGroup.messageCount = groupData.messageCount;
            cachedGroup.mutedUntil = groupData.mutedUntil;
            cachedGroup.name = groupData.name;
            cachedGroup.officeMode = groupData.officeMode;
            cachedGroup.phoneNumber = groupData.phoneNumber;
            cachedGroup.private = groupData.private;
            cachedGroup.requiresApproval = groupData.requiresApproval;
            cachedGroup.showJoinQuestion = groupData.showJoinQuestion;
            cachedGroup.theme = groupData.theme;
            cachedGroup.updatedAt = groupData.updatedAt;
            group = cachedGroup;
        } else {
            group = new Group(groupData);
            this.cache.set(group.id, group);
        }
        return group;
    }
}