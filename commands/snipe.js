const BOTS = require('../models/bots');
const { Discord, MessageEmbed } = require('discord.js');

module.exports.run = async (client, message, args) => {
  message.delete().catch();

  String.prototype.embedify = function () {
    return new MessageEmbed().setColor('#7289DA').setDescription(this);
  };

  let snipe = client.snipeMap.get(message.guild.id);
  if (!snipe)
    return message.channel.send(
      'Could not find a message that was deleted.'.embedify(),
    );

  if (args[0] == 'image') {
    if (!args[1])
      return message.channel.send(
        'Please provide a message to retrieve the image from!'.embedify(),
      );
    let image = snipe[args[1] - 1];
    if (!image[1])
      return message.channel.send(
        'That message does not have an attached (deleted) image!'.embedify(),
      );
    console.log(image[1]);
    return message.channel.send(
      new MessageEmbed().setColor('#7289DA').setImage(image[1]),
    );
  }

  let counter = 0;

  return message.channel.send(
    `${snipe
      .map(
        (msg) =>
          `**${++counter} -** ${
            msg[0].content
              ? `${msg[0].content}${!msg[1] ? '' : '\n[IMAGE WAS DELETED]'}`
              : !msg[1]
              ? ''
              : '[IMAGE WAS DELETED]'
          }\n**Author -** <@${msg[0].author.id}>\n**Channel -** <#${
            msg[0].channel.id
          }>`,
      )
      .join('\n\n')}`
      .embedify()
      .addField(
        'NOTE:',
        `Messages appear in order, newest deleted message is \`1.\` ,etc. Only the last five deleted messages are preserved. Messages above a 200 character limit are truncated to fit within the embed.`,
      ),
  );
};

module.exports.help = {
  name: 'snipe',
  category: 'Utility',
  aliases: ['sniper'],
  description: 'Fetch the content of a Deleted message',
  example: '``snipe``',
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
