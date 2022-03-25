const user_warns = require("../models/Bot/warningsModel");
const { MessageEmbed } = require("discord.js");
const moment = require("moment");

module.exports.run = async (client, message, args) => {
  message.delete().catch();

  try {
    let warnedUser = message.mentions.users.first();

    let userAvatar = client.users.cache.get(warnedUser.id).displayAvatarURL();

    let noUser = new MessageEmbed()
      .setTitle("Hmm, Try again!")
      .setDescription("Warn a member of Paradise Bots")
      .setColor("#7289DA")
      .setDescription("I cant warn air, Please give me a user to warn.");

    if (!warnedUser) return message.channel.send(noUser);

    let theUser = await user_warns.findOne({ userID: warnedUser.id });

    if (!theUser)
      return message.reply(
        "The user you provided has never been warned in my database or the warnings were purged by a mod."
      );

    if (!theUser.numberOfWarns)
      return message.reply(
        "The user you provided has never been warned in my database."
      );

    if (theUser.numberOfWarns === null)
      return message.reply(
        "The user you provided doesnt have any warnings or an error has occurred."
      );

    let clearedStatus;

    if (theUser.recentlyCleared === true) {
      clearedStatus = "true";
    } else {
      clearedStatus = "false";
    }

    let clearedMsg = new MessageEmbed()
      .setTitle(`Warns | ${warnedUser.username}`)
      .setThumbnail(userAvatar)
      .setDescription("Warnings for this user have been purged.")
      .setColor("#7289DA")
      .addField("Was Purged", "true", true)
      .setFooter("© Paradise Bots | 2020", "https://i.imgur.com/Df2seyl.png");

    /*if (theUser.recentlyCleared === true) 
           
           return message.channel.send(clearedMsg);*/

    message.channel.send(
      new MessageEmbed()
        .setTitle(`Warns | ${warnedUser.username}`)
        .setThumbnail(userAvatar)
        .setDescription(
          "Below is some info on this users most recent warn, along with a total count."
        )
        .setColor("#7289DA")
        .addField("Warned By", theUser.warnedByName, true)
        .addField("Warned For", theUser.reasonForWarn, true)
        .addField("Warned On", theUser.dateOfWarn, true)
        .addField("Total Count", `${theUser.numberOfWarns} warns to date`, true)
        .setFooter("© Paradise Bots | 2020", "https://i.imgur.com/Df2seyl.png")
    );
  } catch (e) {
    let errorEmbed = new MessageEmbed();
    errorEmbed.setTitle("Whoops, Something went wrong!!!");
    errorEmbed.setColor("#7289DA");
    errorEmbed.setDescription(
      "If this issue continues please contact our Dev Team"
    );
    errorEmbed.addField("Error", `${e.message}`);
    errorEmbed.setTimestamp();
    message.channel.send(errorEmbed);
  }
};

module.exports.help = {
  name: "warns",
  category: "Moderation",
  aliases: ["strikes"],
  description: "Provides a total count of warns for the provided user",
  example: "``warns <@user>``",
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
