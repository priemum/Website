const BOTS = require('../models/bots');
const { MessageEmbed } = require('discord.js');

module.exports.run = async (client, message, args) => {
  message.delete().catch();

  if (!message.member.hasPermission('MANAGE_MESSAGES', 'ADMINISTRATOR')) {
    var noPerms = new MessageEmbed();
    noPerms.setTitle(':x: Nope :x:');
    noPerms.setColor('#7289DA');
    noPerms.setDescription(
      `<@${message.author.id}> You didn't provide an amount`,
    );
    noPerms.setTimestamp();
    noPerms.setFooter(
      '© Paradise Bots | 2020',
      'https://i.imgur.com/Df2seyl.png',
    );

    return message.channel.send(noPerms);
  } else {
    if (!args[0]) {
      var noAmount = new MessageEmbed();
      noAmount.setTitle('Whoops, You missed a step');
      noAmount.setColor('#7289DA');
      noAmount.setDescription(
        `<@${message.author.id}> You didn't provide an amount`,
      );
      noAmount.setTimestamp();
      noAmount.setFooter(
        '© Paradise Bots | 2020',
        'https://i.imgur.com/Df2seyl.png',
      );

      return message.channel.send(noAmount);
    } else {
      await message.channel.bulkDelete(args[0]);

      var clearDone = new MessageEmbed();
      clearDone.setTitle('Okay, Done!!');
      clearDone.setColor('#7289DA');
      clearDone.setDescription(`Successfully deleted ${args[0]} messages.`);
      clearDone.setTimestamp();
      clearDone.setFooter(
        '© Paradise Bots | 2020',
        'https://i.imgur.com/Df2seyl.png',
      );

      message.channel.send(clearDone);
    }
  }
};

module.exports.help = {
  name: 'clear',
  category: 'Moderation',
  aliases: ['prune', 'purge', 'clean'],
  description: 'Clear the selected amount of messages from the current channel',
  example: '``clear <amount>``',
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
