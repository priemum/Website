const BOTS = require('../models/bots');
const { Discord, MessageEmbed } = require('discord.js');

module.exports.run = async (client, message, args) => {
  message.delete().catch();

  let embed = new MessageEmbed()
    .setTitle('Paradise Bot List | Status')
    .addField('API', '🟢 ONLINE', true)
    .addField('Website', '🟢 ONLINE', true)
    .addField('Documentation', '🟢 ONLINE', true)
    .addField('Paradise Bot', '🟢 ONLINE | Obviously', true)
    .addField(
      'Status Page',
      '[Click Here](https://status.paradisebots.net)',
      true,
    )
    .setFooter('Last Updated: Nov/25/2020 @ 7:20PM MST');

  message.channel.send(embed);
};

module.exports.help = {
  name: 'status',
  category: 'Utility',
  aliases: [],
  description: 'Show the Status of Paradise Bots',
  example: '``status``',
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
