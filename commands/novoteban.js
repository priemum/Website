const VOTES = require("../models/votes");
const { MessageEmbed } = require("discord.js");

module.exports.run = async (client, message, args, guild) => {
  message.delete().catch();

  let user = message.mentions.users.first() || args[0];

  const modLog = message.guild.channels.cache.find(
    (channel) => channel.name === "website-logs"
  );

  if (!user) return message.channel.send(`Provide a User ID.`);

  let theUser = await VOTES.findOne({ user: user }, { _id: false });

  if (theUser.voteBanned === "unbanned" || theUser.voteBanned === null) {
    let embed = new MessageEmbed()
      .setTitle("Whoaa, Cant do that.")
      .setDescription(`<@${user}>) Has not been Vote Banned.`)
      .setTimestamp()
      .setColor(0x26ff00);

    return message.channel.send(embed);
  } else {
    message.delete().catch();
    await VOTES.updateOne({ user: user }, { $set: { voteBanned: "unbanned" } });
    let e = new MessageEmbed()
      .setTitle("User Vote Ban Removed")
      .setDescription(
        "Your bot has been flagged for API or Vote Count Abuse, Please contact a Staff Member for assistance."
      )
      .addField("Mod", message.author, true)
      .addField(
        "Note:",
        "Your bot will not be able to recieve votes until this issue is resolved"
      )
      .setTimestamp()
      .setColor(0x26ff00);

    let e3 = new MessageEmbed()
      .setTitle("User Vote Ban Removed")
      .addField(`User`, `<@${user}>`, true)
      .addField("Mod", message.author, true)
      .setTimestamp()
      .setColor(0x26ff00);
    modLog.send(e3);

    let e2 = new MessageEmbed()
      .setTitle("User Vote Ban Removed")
      .addField(`User`, `<@${user}>`, true)
      .setTimestamp()
      .setColor(0x26ff00);
    //message.channel.send(`Verified \`${bot.username}\``);
    message.channel.send(e2);
  }
};

module.exports.help = {
  name: "novoteban",
  category: "Bot List",
  aliases: [],
  description: "UnBan the provided user from voting",
  example: "``novoteban <@user>``",
};

module.exports.requirements = {
  userPerms: [],
  clientPerms: ["EMBED_LINKS"],
  higherOnly: true,
  ownerOnly: false,
};

module.exports.limits = {
  rateLimit: 2,
  cooldown: 1e4,
};
