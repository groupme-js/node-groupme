import * as Bot from './bot'
import * as Calendar from './calendar'
import * as Group from './group'
import * as Membership from './membership'
import * as Message from './message'
import * as Poll from './poll'

const fnMap = {
    'bot.add': Bot.add,
    'bot.del': Bot.del,

    'calendar.event.created': Calendar.created,
    'calendar.event.starting': Calendar.starting,
    'calendar.event.user.going': Calendar.userGoing,
    'calendar.event.user.not_going': Calendar.userNotGoing,
    'calendar.event.user.undecided': Calendar.userUndecided,

    'group.added_to_directory': Group.addedToDirectory,
    'group.avatar_change': Group.avatarChange,
    'group.like_icon_set': Group.likeIconSet,
    'group.name_change': Group.nameChange,
    'group.office_mode_disabled': Group.officeModeDisabled,
    'group.office_mode_enabled': Group.officeModeEnabled,
    'group.role_change_admin': Group.roleChangeAdmin,
    'group.theme_change': Group.themeChange,
    'group.topic_change': Group.topicChange,
    'group.type_change': Group.typeChange,

    'membership.announce.added': Membership.added,
    'membership.announce.joined': Membership.joined,
    'membership.announce.rejoined': Membership.rejoined,
    'membership.avatar_changed': Membership.avatarChanged,
    'membership.nickname_changed': Membership.nicknameChanged,
    'membership.notifications.autokicked': Membership.autokicked,
    'membership.notifications.exited': Membership.exited,
    'membership.notifications.removed': Membership.removed,

    'message.deleted': Message.deleted,

    'poll.created': Poll.created,
    'poll.reminder': Poll.reminder,
    'poll.finished': Poll.finished,
}

export default fnMap
