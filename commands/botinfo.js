const BOTS = require("../models/bots");
const { MessageEmbed } = require("discord.js");
module.exports.run = async (client, message, args) => {
  message.delete().catch();

  const user = message.mentions.users.first();

  if (!user || !user.bot)
    return message.channel.send(`Ping a **bot** to get info about.`);

  const bot = await BOTS.findOne({ botid: user.id }, { _id: false });

  if (!bot) return message.channel.send(`Bot not found.`);

  let ms = require("ms");

  let approvedOn = ms(Date.now() - bot.date);

  let isPartnered = "";

  if (bot.partneredBot === "partnered") {
    isPartnered = true;
  } else {
    isPartnered = false;
  }

  let isCertified = "";

  if (bot.certifiedBot === "certified") {
    isCertified = true;
  } else {
    isCertified = false;
  }

  let additionals = [];

  if (bot.additionalOwners === []) {
    additionals = "None";
  } else if (bot.additionalOwners < 1) {
    additionals = "None";
  } else {
    bot.additionalOwners.forEach((additional) => {
      additionals += `• <@${additional}>\n`;
    });
  }

  let thebot = client.users.cache.get(bot.botid);

  let botAvatar = `https://cdn.discordapp.com/avatars/${thebot.id}/${thebot.avatar}`;

  let e = new MessageEmbed()
    .setColor(0x6b83aa)
    .setAuthor(bot.username, botAvatar, bot.invite)
    .setDescription(bot.short)
    .addField("Listed", approvedOn + " Ago", true)
    .addField("Certified", isCertified, true)
    .addField("Partnered", isPartnered, true)
    .addField(`Prefix`, bot.prefix ? bot.prefix : "Unknown", true)
    .addField("Made With", bot.library, true)
    .addField("Votes", bot.votes, true)
    .addField(`Owner`, `<@${bot.owner}>`, true)
    .addField(`Additional Owners`, additionals, true)
    .addField(`State`, bot.status, true)
    .addField(
      "Bot Page",
      `[${bot.username}s Page](https://paradisebots.net/bots/${bot.botid})`,
      true
    )
    .addField("Bot Invite", `[Invite ${bot.username}](${bot.invite})`, true)
    .setThumbnail(botAvatar)
    .setFooter(
      `Requested By: ${message.author.username}`,
      message.author.displayAvatarURL
    );
  message.channel.send(e);
};

module.exports.help = {
  name: "botinfo",
  category: "info",
  aliases: ["bot-info"],
  description: "Shows you some information about the provided bot",
  example: "``botinfo <@bot>``",
};

module.exports.requirements = {
  userPerms: [],
  clientPerms: ["EMBED_LINKS"],
  ownerOnly: false,
};

module.exports.limits = {
  rateLimit: 2,
  cooldown: 1e4,
};
