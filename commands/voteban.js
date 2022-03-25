const VOTES = require('../models/votes');
const { MessageEmbed } = require('discord.js');

module.exports.run = async (client, message, args, guild) => {
  message.delete().catch();

  let user = message.mentions.users.first() || args[0];

  const modLog = message.guild.channels.cache.find(
    (channel) => channel.name === 'website-logs',
  );

  if (!user) return message.channel.send(`Provide a User or User ID.`);

  if (user === message.author) return message.reply('No');

  let theUser = await VOTES.findOne({ user: user }, { _id: false });

  if (theUser.voteBanned === 'banned') {
    let embed = new MessageEmbed()
      .setTitle('Whoaa, Cant do that.')
      .setDescription(`<@${user}) Has already been Vote Banned.`)
      .setTimestamp()
      .setColor(0x26ff00);

    return message.channel.send(embed);
  } else {
    message.delete().catch();
    await VOTES.updateOne({ user: user }, { $set: { voteBanned: 'banned' } });
    let e = new MessageEmbed()
      .setTitle('User has been Vote Banned')
      .setDescription(
        'Your bot has been flagged for API or Vote Count Abuse, Please contact a Staff Member for assistance.',
      )
      .addField('Mod', message.author, true)
      .addField(
        'Note:',
        'Your bot will not be able to recieve votes until this issue is resolved',
      )
      .setTimestamp()
      .setColor(0x26ff00);

    let e3 = new MessageEmbed()
      .setTitle('User has been Vote Banned')
      .addField(`User`, `<@${user}>`, true)
      .addField(`Reason`, `API or Vote Count Abuse.`)
      .addField('Mod', message.author, true)
      .setTimestamp()
      .setColor(0x26ff00);
    modLog.send(e3);

    let e2 = new MessageEmbed()
      .setTitle('User was Vote Banned')
      .addField(`User`, `<@${user}>`, true)
      .setTimestamp()
      .setColor(0x26ff00);
    //message.channel.send(`Verified \`${bot.username}\``);
    message.channel.send(e2);
  }
};

module.exports.help = {
  name: 'voteban',
  category: 'Bot List',
  aliases: [],
  description: 'Ban the provided user from voting',
  example: '``voteban <@user>``',
};

module.exports.requirements = {
  userPerms: [],
  clientPerms: ['EMBED_LINKS'],
  higherOnly: false,
  ownerOnly: true,
};

module.exports.limits = {
  rateLimit: 2,
  cooldown: 1e4,
};
