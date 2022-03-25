const BOTS = require("../models/bots");
const { MessageEmbed } = require("discord.js");

module.exports.run = async (client, message, args) => {
  message.delete().catch();

  try {
    var apiMessage = new MessageEmbed();
    apiMessage.setAuthor("Paradise API ", "https://i.imgur.com/Df2seyl.png");
    apiMessage.setColor("#7289DA");
    apiMessage.addField("Current Version", "Version 1.0.7");
    apiMessage.addField(
      "NPM Module",
      "[Click Here](https://www.npmjs.com/package/paradiseapi.js)",
      true
    );
    apiMessage.addField(
      "Python Wrapper",
      "[Click Here](https://gist.github.com/Aryamaan08/6833f31218b00f7792dc900728b0db01)",
      true
    );
    apiMessage.addField(
      "API Docs",
      "[Click Here](https://paradisebots.net/api/v1/docs)",
      true
    );
    apiMessage.addField(
      "Paradise Docs",
      "[Click Here](https://docs.paradisebots.net)",
      true
    );
    apiMessage.setTimestamp();
    apiMessage.setFooter(
      "© Paradise Bots | 2020",
      "https://i.imgur.com/Df2seyl.png"
    );

    message.channel.send(apiMessage);
  } catch (e) {
    var embed2 = new MessageEmbed();
    embed2.setTitle("Whoops, Something went wrong!!!");
    embed2.setColor("#7289DA");
    embed2.setDescription(
      "If this issue continues please contact our Dev Team"
    );
    embed2.addField("Error", `${e.message}`);
    embed2.setTimestamp();

    return message.channel.send(embed2);
  }
};

module.exports.help = {
  name: "api",
  category: "Info",
  aliases: ["api-into "],
  description: "Shows some information about our API",
  example: "``api``",
};

module.exports.requirements = {
  userPerms: [],
  clientPerms: ["EMBED_LINKS"],
  ownerOnly: true,
};

module.exports.limits = {
  rateLimit: 2,
  cooldown: 1e4,
};
