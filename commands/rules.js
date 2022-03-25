const BOTS = require('../models/bots');
const { Discord, MessageEmbed } = require('discord.js');

module.exports.run = async (client, message, args) => {
  message.delete().catch();

  let embed = new MessageEmbed()
    .setTitle('Welcome to Paradise Bot List')
    .setColor('#7289DA')
    .setDescription(
      'As some added protection measures and to ensure the well-being of our server we have established a series of rules which you can find here along with some useful links\n\n**All members of the Paradise Bots server are expected to act in accordance with the Rules and Policys listed below**',
    )
    .addField(
      'Rules & Policys',
      '[Server Rules](https://paradisebots.net/serverrules) | [Bot Rules](https://paradisebots.net/botrules) | [Policys](https://paradisebotlist.github.io/Server-Documentation/channel_text/information/rules-and-info.html)',
      true,
    )
    .addField(
      'Legal Info',
      '[Terms & Privacy](https://paradisebots.net/legal) | © Pardise Bots LLC ',
      true,
    )
    .addField(
      'Documentation',
      '[API Docs](https://paradisebots.net/api/v1/docs) | [Website Docs](https://docs.paradisebots.net) | [Server Docs](https://paradisebotlist.github.io/Server-Documentation)',
      true,
    )
    .addField(
      'Useful Links',
      '[Status](http://stats.paradisebots.net) | [Trello](https://trello.com/b/9IF0vswN/paradise-bot-list)',
      true,
    )
    .addField(
      'Social Media',
      '[Twitter](https://twitter.com/ParadiseBotList) | [GitHub](https://github.com/ParadiseBotList)',
      true,
    )
    .setFooter('Last Updated: Nov/25/2020 @ 8:01PM MST');

  message.channel.send(embed);
};

module.exports.help = {
  name: 'rules',
  category: 'Utility',
  aliases: ['policys'],
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
