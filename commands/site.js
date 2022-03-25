const BOTS = require("../models/bots");
const { MessageEmbed } = require("discord.js");

module.exports.run = async (client, message, args) => {
  message.delete().catch();

  var embed = new MessageEmbed();
  embed.setColor("#7289DA");
  embed.setDescription("Here is some links to get you started");
  embed.addField("Website", "[paradisebots.net](https://paradisebots.net)");
  embed.addField(
    "Terms",
    "[paradisebots.net/terms](https://paradisebots.net/terms)"
  );
  embed.addField(
    "Privacy",
    "[paradisebots.net/privacy](https://paradisebots.net/privacy)"
  );
  embed.addField(
    "Partners",
    "[paradisebots.net/partners](https://paradisebots.net/partners)"
  );
  embed.addField(
    "Staff",
    "[paradisebots.net/staff](https://paradisebots.net/staff)"
  );
  embed.addField(
    "Applications",
    "[paradisebots.net/apps](https://paradisebots.net/apps)"
  );
  embed.setTimestamp();
  embed.setFooter("© Paradise Bots | 2020", "https://i.imgur.com/Df2seyl.png");

  message.channel.send(embed);
};

module.exports.help = {
  name: "site",
  category: "Info",
  aliases: ["website"],
  description: "Website links :man_shrugging:",
  example: "``site``",
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
