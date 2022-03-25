const BOTS = require('../models/bots');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

module.exports.run = async (client, message, args) => {
  message.delete().catch();

  let channel = message.guild.channels.cache.find(
    (channel) => channel.name === 'suggestions',
  );

  const noPerms = new MessageEmbed()
    .setColor('#7289DA')
    .setTitle(':x: Error: Missing Perms :x:')
    .setDescription(
      'Sorry, i dont have the perms to do that i need ``ADD_REACTIONS``.',
    )
    .setFooter(
      'Suggestion by ' + message.author.username,
      message.author.avatarURL,
    )
    .setTimestamp();

  if (!message.guild.member(client.user).hasPermission('ADD_REACTIONS'))
    return message.reply(noPerms);

  const sayMessage = args.join(' ');

  const noSuggest = new MessageEmbed()
    .setColor('#7289DA')
    .setTitle(':x: Error: Missing Args :x:')
    .setDescription('Please provide a suggestion')
    .setTimestamp();

  if (!sayMessage) return message.channel.send(noSuggest);

  const embed = new MessageEmbed()
    .setColor('#7289DA')
    .setTitle('New Suggestion')
    .addField('User', `<@${message.author.id}>`)
    .addField('Suggestion:', `**${sayMessage}**!`)
    .setFooter(
      'Suggestion by ' + message.author.username,
      message.author.displayAvatarURL,
    )
    .setTimestamp();
  return channel.send(embed).then((m) => {
    m.react('⬆');
    m.react('⬇');
  });
};

module.exports.help = {
  name: 'suggest',
  category: 'info',
  aliases: ['suggestion'],
  description:
    'Make a Suggestion for Paradise Bot List and have it Auto sent to the Suggestions Channel.',
  example: '``suggets <messageHere>``',
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
