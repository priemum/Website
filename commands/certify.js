const BOTS = require("../models/bots");
const { MessageEmbed } = require("discord.js");

module.exports.run = async (client, message, args, guild) => {
  message.delete().catch();

  let user = message.mentions.users.first() || args[0];

  const modLog = message.guild.channels.cache.find(
    (channel) => channel.name === "website-logs"
  );

  const certifiedBotRole = message.guild.roles.cache.get("755156793671548979");

  const certifiedDevRole = message.guild.roles.cache.get("759599781487181865");

  if (!user || !user.bot) return message.channel.send(`Ping a **bot**.`);

  let bot = await BOTS.findOne({ botid: user.id }, { _id: false });

  if (bot.certifiedBot === "certified") {
    let embed = new MessageEmbed()
      .setTitle("Whoaa, Cant do that.")
      .setDescription(`${bot.username} Has already been Certified.`)
      .setThumbnail(bot.avatar)
      .setTimestamp()
      .setColor(0x26ff00);

    return message.channel.send(embed);
  } else {
    message.delete().catch();
    await BOTS.updateOne(
      { botid: user.id },
      { $set: { is_certified: true, certifiedBot: "certified" } }
    );
    let e = new MessageEmbed()
      .setTitle("Bot Certified")
      .addField(`Bot`, `<@${bot.botid}>`, true)
      .addField(`Owner`, `<@${bot.owner}>`, true)
      .addField("Mod", message.author, true)
      .setThumbnail(bot.avatar)
      .setTimestamp()
      .setColor(0x26ff00);
    modLog.send(e);

    modLog.send(`<@${bot.owner}>`).then((m) => {
      m.delete();
    });

    message.guild.members
      .fetch(message.client.users.cache.find((u) => u.id === bot.owner))
      .then((owner) => {
        owner.send(e);
        //owner.roles.add(message.guild.roles.cache.get(r => r.id === '759599781487181865'))
        owner.roles.add(certifiedDevRole);
      });
    message.guild.members
      .fetch(message.client.users.cache.find((u) => u.id === bot.botid))
      .then((bot) => {
        //bot.roles.remove([process.env.UNVERIFIED_ROLE_ID]);
        //bot.roles.set(message.guild.roles.cache.get(r => r.id === '755156793671548979'));
        bot.roles.add(certifiedBotRole);
      });

    let e2 = new MessageEmbed()
      .setTitle("Bot was Certified")
      .addField(`Bot`, `${bot.username}`, true)
      .addField(`Owner`, `<@${bot.owner}>`, true)
      .setThumbnail(bot.avatar)
      .setTimestamp()
      .setColor(0x26ff00);
    //message.channel.send(`Verified \`${bot.username}\``);
    message.channel.send(e2);
  }
};

module.exports.help = {
  name: "certify",
  category: "Bot List",
  aliases: [],
  description: "Certify the provided bot",
  example: "``certify <@bot>``",
};

module.exports.requirements = {
  userPerms: [],
  clientPerms: ["EMBED_LINKS"],
  higherOnly: true,
};

module.exports.limits = {
  rateLimit: 2,
  cooldown: 1e4,
};
