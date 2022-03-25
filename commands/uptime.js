const BOTS = require('../models/bots');
const { Discord, MessageEmbed } = require('discord.js');

module.exports.run = async (client, message, args) => {
  message.delete().catch();

  var milliseconds = parseInt((client.uptime % 1000) / 100),
    seconds = parseInt((client.uptime / 1000) % 60),
    minutes = parseInt((client.uptime / (1000 * 60)) % 60),
    hours = parseInt((client.uptime / (1000 * 60 * 60)) % 24);

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  let embed = new MessageEmbed()
    .setTitle('Paradise Bot List | Uptime')
    .addField('Hours', `${hours}`)
    .addField('Minutes', `${minutes}`)
    .addField('Seconds', `${seconds}`);

  message.channel.send(embed);
};

module.exports.help = {
  name: 'uptime',
  category: 'Utility',
  aliases: ['bottime'],
  description: 'Show the Uptime of Paradise Bot and the Website',
  example: '``uptime``',
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
