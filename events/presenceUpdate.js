const config = require('../config.js');

module.exports = async (oldMember, newMember) => {
  if (!newMember) return;
  if (newMember.user.bot) return;
  if (!newMember.member.presence.activities[0]) return;
  if (
    newMember.member.presence.activities[0].state &&
    newMember.member.presence.status !== 'offline'
  ) {
    newMember.member.presence.activities[0].state.match(/(paradisebots.net)/gi)
      ? newMember.member.roles.add(config.linkedStatus)
      : newMember.member.roles.remove(config.linkedStatus);
  }
};
