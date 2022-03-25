const BOTS = require('../models/bots');
const { MessageEmbed } = require('discord.js');
module.exports.run = async (client, message, args) => {
  message.delete().catch();

  //check if more than 1 user is mentioned
  if (args.length > 1) return message.channel.send('Only mention one user!');

  //check if there is no arguments
  if (!args[0]) return message.channel.send('Mention someone!');

  //check if there is 1 argument
  if (args[0]) {
    let member =
      message.mentions.members.first() || client.users.cache.get(args[0]);

    let customStatus;

    member.presence.activities.forEach((activity) => {
      if (activity.type === 'CUSTOM_STATUS') {
        customStatus = activity.state;
      } else if (activity.type === 'undefined') {
        customStatus = 'No status set';
      } else {
        customStatus = 'No status set';
      }
    });

    if (!member || member.bot)
      return message.channel.send(`Ping a **user** to get info about.`);
    //if (user.id === message.client.user.id) return message.channel.send(`-_- No`);

    let userBots = await BOTS.find({ owner: member.user.id }, { _id: false });

    //if the member exists create an embed with info about that user and send it to the channel
    if (member) {
      let embed = new MessageEmbed()
        .setTitle('Member Information')
        .setThumbnail(member.user.displayAvatarURL())
        .setAuthor(
          `${member.user.tag} (${member.user.id})`,
          member.user.displayAvatarURL(),
        )
        .addField('**Username:**', `${member.user.username}`, true)
        .addField('**Discriminator:**', `${member.user.discriminator}`, true)
        .addField('**ID:**', `${member.user.id}`, true)
        .addField('**Bots:**', `${userBots.length} Bots listed`, true)
        .addField('**Custom Status**', customStatus, true)
        .addField('**Joined On:**', `${member.joinedAt.toLocaleString()}`, true)
        .addField(
          '**Created On:**',
          `${member.user.createdAt.toLocaleString()}`,
          true,
        )
        .setDescription(
          `Assigned Roles: ${member.roles.cache
            .map((role) => role.toString())
            .join(' ')}`,
        )
        .setFooter(`Requested By: ${message.author.username}`);

      message.channel.send(embed);
    } else {
      message.channel.send(`Could not find that member`); //send a message to the channel if the user doesn't exist
    }
  }
};

module.exports.help = {
  name: 'userinfo',
  category: 'info',
  aliases: ['whois'],
  description: 'Shows you some information about the provided user',
  example: '``userinfo <@user>``',
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
