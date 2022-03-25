const { MessageEmbed } = require("discord.js");
const moment = require("moment");
const BOTS = require("../models/bots");

module.exports = async (client, member) => {
  //const welcomeChannel = member.guild.channels.cache.get("762752153168117800")

  const memberavatar = member.user.displayAvatarURL;

  const welcomeChannel = member.guild.channels.cache.find(
    (chnl) => chnl.name === "┊greetings"
  );

  const theMember = await client.users.cache.get(member.user.id);

  if (theMember.bot) {
    let count = member.guild.memberCount.toString();

    let end = count[count.length - 1];

    let suffixed =
      end == 1 ? count : end == 2 ? count : end == 3 ? count : count;

    const botLeaveMessage = new MessageEmbed()
      .setTitle("➖ A Bot has Left ➖")
      .setDescription("Hmm, A bot left the Server, is this a mistake?")
      .addField("Member", `${member.user.username}`, true)
      .addField("New Member Count", `${suffixed} Members`, true)
      .addField(
        "Joined Discord",
        `${moment(member.user.createdAt).toString().substr(0, 15)}\n(${moment(
          member.user.createdAt
        ).fromNow()})`,
        true
      )
      .addField(
        "Joined Server",
        `${moment(member.user.joinedAt).toString().substr(0, 15)}\n(${moment(
          member.user.joinedAt
        ).fromNow()})`,
        true
      )
      .setThumbnail(theMember.displayAvatarURL());

    return welcomeChannel.send(botLeaveMessage);
  } else if (!theMember.bot) {
    let count = member.guild.memberCount.toString();

    let end = count[count.length - 1];

    let suffixed =
      end == 1 ? count : end == 2 ? count : end == 3 ? count : count;

    const leaveMessage = new MessageEmbed()
      .setTitle("➖ A Member has Left ➖")
      .setDescription("Hmm, Someone left the Server.")
      .addField("Member", `${member.user.username}`, true)
      .addField("New Member Count", `${suffixed} Members`, true)
      .addField(
        "Joined Discord",
        `${moment(member.user.createdAt).toString().substr(0, 15)}\n(${moment(
          member.user.createdAt
        ).fromNow()})`,
        true
      )
      .addField(
        "Joined Server",
        `${moment(member.user.joinedAt).toString().substr(0, 15)}\n(${moment(
          member.user.joinedAt
        ).fromNow()})`,
        true
      )
      .setThumbnail(theMember.displayAvatarURL());

    welcomeChannel.send(leaveMessage);

    let check = await BOTS.find({ owner: member.user.id });
    if (check.length > 0) {
      member.guild.channels.cache.get(client.config.botlogs).send(
        new MessageEmbed()
          .setAuthor(
            member.user.username,
            member.user.displayAvatarURL({ dynamic: true })
          )
          .setDescription(
            `
            ${check.map((bot) => `<@!${bot.botid}>`).join("**, **")}
            Got Archived because the Owner left our Server!
            `
          )
          .setTimestamp()
      );
      check.map(async (bot) => {
        bot.status = "denied";
        await bot.save();
        member.guild.members.cache
          .get(bot.botid)
          .kick()
          .catch(() => {});
      });
    }
  }
};
