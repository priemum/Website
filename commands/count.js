const BOTS = require('../models/bots');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

module.exports.run = async (client, message, args) => {
  message.delete().catch();

  let bots = await BOTS.find({ status: 'approved' }, { _id: false });

  message.channel.send(
    new MessageEmbed()
      .setTitle('Paradise Bots Info')
      .setDescription(`We currently have ${bots.length} bots in our list`)
      .setColor('#7289DA')
      .setFooter('© Paradise Bots | 2020', 'https://i.imgur.com/Df2seyl.png'),
  );
};

module.exports.help = {
  name: 'count',
  category: 'info',
  aliases: ['bot-count'],
  description: 'Provides a total count of bots in our list',
  example: '``botinfo <@bot>``',
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
