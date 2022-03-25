const BOTS = require('../models/bots');
const { MessageEmbed } = require('discord.js');

module.exports.run = async (client, message, args) => {
  message.delete().catch();

  if (!message.member.hasPermission(['KICK_MEMBERS', 'BAN_MEMBERS'])) {
    var noPerms = new MessageEmbed();
    noPerms.setTitle(':x: Nope :x:');
    noPerms.setColor('#7289DA');
    noPerms.setDescription(
      `<@${message.author.id}> You don't have permission to use this command.`,
    );
    noPerms.setTimestamp();
    noPerms.setFooter(
      '© Paradise Bots | 2020',
      'https://i.imgur.com/Df2seyl.png',
    );

    message.channel.send(noPerms);
  } else if (!args[0]) {
    var noUser = new MessageEmbed();
    noUser.setTitle(':x: Nope :x:');
    noUser.setColor('#7289DA');
    noUser.setDescription(
      `<@${message.author.id}> You didn't mention someone to unmute.`,
    );
    noUser.setTimestamp();
    noUser.setFooter(
      '© Paradise Bots | 2020',
      'https://i.imgur.com/Df2seyl.png',
    );

    message.channel.send(noUser);
  } else if (!args[1]) {
    var noReason = new MessageEmbed();
    noReason.setTitle('But!! Why??');
    noReason.setColor('#7289DA');
    noReason.setDescription(
      `<@${message.author.id}> You didn't provide a reason`,
    );
    noReason.setTimestamp();
    noReason.setFooter(
      '© Paradise Bots | 2020',
      'https://i.imgur.com/Df2seyl.png',
    );

    message.channel.send(noReason);
  } else {
    let muted =
      message.guild.member(message.mentions.users.first()) ||
      message.guild.members.cache.get(args.slice(0).join(' '));

    const muter = message.author.tag;

    const reason = args[1];

    const modLogs = message.guild.channels.cache.find(
      (channel) => channel.name === 'mod-logs',
    );

    if (
      muted.hasPermission('BAN_MEMBERS') &&
      !message.member.hasPermission('ADMINISTRATOR')
    ) {
      var cantMute = new MessageEmbed();
      cantMute.setTitle('Cant do it!!');
      cantMute.setColor('#7289DA');
      cantMute.setDescription(
        `<@${message.author.id}> That user can't be unmuted, How high are their perms!`,
      );
      cantMute.setTimestamp();
      cantMute.setFooter(
        '© Paradise Bots | 2020',
        'https://i.imgur.com/Df2seyl.png',
      );

      message.channel.send(cantMute);
    } else {
      let mutedRole = message.guild.roles.cache.get('748977820457238535');

      if (mutedRole) {
        await muted.roles.remove(mutedRole);

        var muteEmbed = new MessageEmbed();
        muteEmbed.setTitle('User UnMuted');
        muteEmbed.setColor('#7289DA');
        muteEmbed.addField('User', `${muted}`);
        muteEmbed.addField('Moderator', `${muter}`);
        muteEmbed.addField('Reason', `${reason}`);
        muteEmbed.setTimestamp();
        muteEmbed.setFooter(
          '© Paradise Bots | 2020',
          'https://i.imgur.com/Df2seyl.png',
        );

        modLogs.send(muteEmbed);
      } else {
        var notFound = new MessageEmbed();
        notFound.setTitle(':x: Nope :x:');
        notFound.setColor('#7289DA');
        notFound.setDescription(
          `<@${message.author.id}> Couldn't find the ``Muted`` role for this server, are you sure it exists. -_-!!`,
        );
        notFound.setTimestamp();
        notFound.setFooter(
          '© Paradise Bots | 2020',
          'https://i.imgur.com/Df2seyl.png',
        );

        message.channel.send(notFound);
      }
    }
  }
};

module.exports.help = {
  name: 'unmute',
  category: 'Moderation',
  aliases: [],
  description: 'Mute the Provided User or Bot.',
  example: '``mute <@metnion>``',
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
