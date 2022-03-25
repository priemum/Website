const user_warns = require('../models/Bot/warningsModel');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

module.exports.run = async (client, message, args) => {
  message.delete().catch();

  try {
    let user = message.mentions.users.first();

    let warnedUser = await client.users.cache.get(user.id);

    let userAvatar = client.users.cache.get(warnedUser.id).displayAvatarURL();

    let noUser = new MessageEmbed()
      .setTitle('Hmm, Try again!')
      .setDescription('Warn a member of Paradise Bots')
      .setColor('#7289DA')
      .setDescription('I cant warn air, Please give me a user to warn.');

    if (!user) return message.channel.send(noUser);

    let theUser = await user_warns.findOne({ userID: warnedUser.id });

    if (!theUser)
      return message.reply(
        'The user you provided has never been warned in my database or the warnings were purged by a mod.',
      );

    if (!theUser.numberOfWarns)
      return message.reply(
        'The user you provided has never been warned in my database.',
      );

    if (theUser.numberOfWarns === null)
      return message.reply(
        'The user you provided doesnt have any warnings or an error has occurred.',
      );

    await user_warns.updateOne(
      { userID: warnedUser.id },
      { $set: { numberOfWarns: 0, recentlyCleared: true } },
    );

    message.channel.send(
      new MessageEmbed()
        .setTitle(`Cleared Warns | ${warnedUser.username}`)
        .setThumbnail(userAvatar)
        .setDescription('Warnings for this user have been cleared.')
        .setColor('#7289DA')
        .setFooter('© Paradise Bots | 2020', 'https://i.imgur.com/Df2seyl.png'),
    );
  } catch (e) {
    let errorEmbed = new MessageEmbed();
    errorEmbed.setTitle('Whoops, Something went wrong!!!');
    errorEmbed.setColor('#7289DA');
    errorEmbed.setDescription(
      'If this issue continues please contact our Dev Team',
    );
    errorEmbed.addField('Error', `${e.message}`);
    errorEmbed.setTimestamp();
    message.channel.send(errorEmbed);
  }
};

module.exports.help = {
  name: 'clear-warns',
  category: 'Moderation',
  aliases: ['strike-list'],
  description: 'Provides a list of warns for the provided user',
  example: '``clear-warns <@user>``',
};

module.exports.requirements = {
  userPerms: [],
  clientPerms: ['EMBED_LINKS'],
  ownerOnly: true,
};

module.exports.limits = {
  rateLimit: 2,
  cooldown: 1e4,
};
