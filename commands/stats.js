const BOTS = require('../models/bots');
const { Discord, MessageEmbed } = require('discord.js');

module.exports.run = async (client, message, args) => {
  message.delete().catch();

  let embed = new MessageEmbed()
    .setTitle('Paradise Bot List | Statistics')
    .addField('OS:', 'Linux 64-bit | Heroku Scaled', true)
    .addField('Node Version', process.version, true)
    .addField('Made With', `discord.js v12.2.0`, true)
    .addField(
      'API version:',
      `v1.0.8 | [Change Log](https://docs.paradisebots.net/changelog/api/Paradise-API-v1.0.8/)`,
      true,
    )
    .addField(
      'Bot version:',
      `v2.1.0| [Change Log](https://docs.paradisebots.net/changelog/bot/Paradise-Bot-v2.10/)`,
      true,
    )
    .addField(
      'Website version:',
      `v2.2.0 | [Change Log](https://docs.paradisebots.net/changelog/site/Paradise-v2.2.0/ )`,
      true,
    )
    .addField('Database', 'MongoDB', true)
    .addField('Database Version', 'v4.2.6 | WiredTiger', true)
    .addField('Website Lib', 'Embedded JavaScript | EJS', true)
    .setFooter('Created with ❤️ by Toxic Dev');

  message.channel.send(embed);
};

module.exports.help = {
  name: 'stats',
  category: 'Utility',
  aliases: ['paradise-stats'],
  description: 'Show some info and statistics for Paradise Bot List',
  example: '``stats``',
};

module.exports.requirements = {
  userPerms: [],
  clientPerms: ['EMBED_LINKS'],
  ownerOnly: false,
};

module.exports.limits = {
  rateLimit: 2,
  cooldown: 1e4,
};
