const BOTS = require("../models/bots");
const { MessageEmbed } = require("discord.js");

module.exports.run = async (client, message, args, guild) => {
  message.delete().catch();

  try {
    let bot = message.mentions.users.first();

    let reason = args.slice(1).join(" ");

    const modLog = message.guild.channels.cache.find(
      (channel) => channel.name === "website-logs"
    );

    const botDevRole = message.guild.roles.cache.get("748977820776267868");

    const verifiedBotRole = message.guild.roles.cache.get("748977820457238534");

    const botsInQRole = message.guild.roles.cache.get("748977820457238533");

    if (!bot || !bot.bot) return message.channel.send(`Ping a **bot**.`);

    if (!reason)
      return message.reply("Please provide a reason and or feedback.");

    const botToVerify = await BOTS.findOne({ botid: bot.id }, { _id: false });

    const botOwner = await client.users.cache.get(botToVerify.owner);

    const botAvatar = client.users.cache
      .get(botToVerify.botid)
      .displayAvatarURL();

    if (botToVerify.status === "approved") {
      let embed = new MessageEmbed()
        .setTitle("Whoaa, Cant do that.")
        .setDescription(`${bot.username} Has already been Verified.`)
        .setTimestamp()
        .setColor(0x26ff00);

      return message.channel.send(embed);
    } else {
      message.delete().catch();

      await BOTS.updateOne({ botid: bot.id }, { $set: { status: "approved" } });

      let e = new MessageEmbed()
        .setTitle("Bot Approved ")
        .addField(`Bot`, `${bot.username}`, true)
        .addField("Mod", message.author, true)
        .addField("Feedback", reason, true)
        .addField("Owner", botOwner.username, true)
        .setTimestamp()
        .setThumbnail(botAvatar)
        .setColor(0x26ff00);

      let e3 = new MessageEmbed()
        .setTitle("Your Bot was Approved ")
        .addField(`Bot`, `${bot.username}`, true)
        .addField("Mod", message.author, true)
        .addField("Feedback", reason, true)
        .setTimestamp()
        .setColor(0x26ff00);

      modLog.send(e);

      message.guild.members
        .fetch(
          message.client.users.cache.find((u) => u.id === botToVerify.owner)
        )
        .then((botOwner) => {
          botOwner.roles.add(botDevRole);

          botOwner.send(e3);
        });

      message.guild.members
        .fetch(
          message.client.users.cache.find((u) => u.id === botToVerify.botid)
        )
        .then((bot) => {
          bot.roles.remove(botsInQRole);

          bot.roles.add(verifiedBotRole);
        });

      let e2 = new MessageEmbed()
        .setTitle("Bot was Apporved")
        .addField(`Bot`, `${bot.username}`, true)
        .setTimestamp()
        .setColor(0x26ff00);
      //message.channel.send(`Certified \`${user.username}\``);

      message.channel.send(e2);
    }
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
  name: "verify",
  category: "Bot List",
  aliases: ["approve"],
  description: "Verify/Approve the provided bot.",
  example: "``verify <@bot>``",
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
