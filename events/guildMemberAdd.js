const { MessageEmbed } = require("discord.js");
const moment = require("moment");

module.exports = async (client, member) => {
  //const welcomeChannel = member.guild.channels.cache.get("762752153168117800")

  const memberavatar = member.user.displayAvatarURL();

  const welcomeChannel = member.guild.channels.cache.find(
    (chnl) => chnl.name === "┊greetings"
  );

  const botsInQRole = member.guild.roles.cache.get("748977820457238533");

  const membersRole = member.guild.roles.cache.get("748977820776267866");

  const theMember = await client.users.cache.get(member.user.id);

  if (theMember.bot) {
    let count = member.guild.memberCount.toString();

    let end = count[count.length - 1];

    let suffixed =
      end == 1 ? count : end == 2 ? count : end == 3 ? count : count;

    const botJoinMessage = new MessageEmbed()
      .setTitle("➕ A Bot has Joined ➕")
      .setDescription("A bot has been added to the Server for testing!")
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

    welcomeChannel.send(botJoinMessage);

    member.guild.members
      .fetch(client.users.cache.find((u) => u.id === member.id))
      .then((bot) => {
        bot.roles.add(botsInQRole);
      });
  } else if (!theMember.bot) {
    let count = member.guild.memberCount.toString();

    let end = count[count.length - 1];

    let suffixed =
      end == 1 ? count : end == 2 ? count : end == 3 ? count : count;

    let rules = await member.guild.channels.cache.find(
      (c) => c.id === "748977820784394244"
    );
    let subChan = await member.guild.channels.cache.find(
      (c) => c.id === "762752158809587732"
    );

    const welcomeMessage = new MessageEmbed()
      .setTitle("➕ A Member has Joined ➕")
      .setDescription(
        `Welcome to Paradise <@${member.user.id}>, Make sure you check out the ${rules} channel and enjoy your stay.`
      )
      .addField("Member", `${member.user.username}`, true)
      .addField("Discrim", `${member.user.discriminator}`, true)
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
      .addField(
        "Subscribe to Updates",
        "`p>sub` or Visit: " + `${subChan}`,
        true
      )
      .setThumbnail(theMember.displayAvatarURL());

    welcomeChannel.send(welcomeMessage);

    member.guild.members
      .fetch(client.users.cache.find((u) => u.id === member.id))
      .then((user) => {
        user.roles.add(membersRole);
      });
  }
};
