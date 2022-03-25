const BOTS = require('../models/bots');
const { MessageEmbed } = require('discord.js');

module.exports.run = async (client, message, args) => {
  message.delete().catch();

  const word = args.join(' ');
  if (word < 1)
    return message.channel.send(
      "Really though -_-, You didn't provide any text to embed",
    );

  var embed = new MessageEmbed();
  embed.setColor('#7289DA');
  embed.setDescription(word);
  embed.setTimestamp();
  embed.setFooter('© Paradise Bots | 2020', 'https://i.imgur.com/Df2seyl.png');

  message.channel.send(embed);
};

module.exports.help = {
  name: 'embed',
  category: 'Info',
  aliases: ['embedded'],
  description: 'Send a message in a Embed',
  example: '``embed <Message Here>``',
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
