const { MessageEmbed } = require('discord.js');

const user_warns = require('../models/Bot/warningsModel');
const botSettings = require('../models/Bot/settingsModel');
const logs = require('../models/Bot/logsModel');

module.exports.run = async (client, message, args) => {
  message.delete().catch();

  try {
    let warnedUser = message.mentions.users.first();

    let noUser = new MessageEmbed()
      .setTitle('Hmm, Try again!')
      .setDescription('Warn a member of Paradise Bots')
      .setColor('#7289DA')
      .setDescription('I cant warn air, Please give me a user to warn.');

    let warnHelp = new MessageEmbed()
      .setTitle('Warn Command Help')
      .setDescription('Warn a member of Paradise Bots')
      .setColor('#7289DA')
      .addField('Usage', 'p>warn @User <reason>', true)
      .addField('Example', 'p>warn @Toxic Dev Being to toxic', true);

    if (!warnedUser) return message.channel.send(warnHelp);

    if (warnedUser.id === message.author.id)
      return message.reply('Why would i let you do that!!');

    let theUser = await user_warns.findOne({ userID: warnedUser.id });

    let modLogs = message.guild.channels.cache.find(
      (c) => c.name === 'mod-logs',
    );

    let warnedBy = await client.users.cache.get(message.author.id);

    let noPerms = new MessageEmbed()
      .setTitle('Hmm, Somethings wrong!')
      .setColor('#7289DA')
      .setDescription(
        'You dont have perms to use this command, If you believe this is a mistake please contact any of our Onwers or Head Admins for assistance.',
      )
      .addField('Required Perms', 'Server Admin | Database Managed');

    //if (!botSettings.serverAdmins.includes(message.author.id)) return message.channel.send(noPerms);

    let reasonForWarn = args.slice(1).join(' ');

    if (reasonForWarn.length < 1) return message.channel.send(warnHelp);

    if (reasonForWarn.length > 100)
      return message.channel.send(
        'The reason should not be more then 100 Characters.',
      );

    if (!theUser) {
      theUser = await new user_warns({
        userID: warnedUser.id,
        userName: warnedUser.username,
        warnedBy: warnedBy.id,
        warnedByName: warnedBy.username,
        reasonForWarn: reasonForWarn,
        numberOfWarns: 1,
      }).save();

      message.channel.send(
        new MessageEmbed()
          .setTitle('Action: User Warn')
          .setColor('#7289DA')
          .setDescription(`${warnedUser.username} Has been warned`)
          .addField('Warned by', `${warnedBy.username}`, true)
          .addField('Warned For', `${reasonForWarn}`, true)
          .addField('Number of Warns', `${theUser.numberOfWarns}`)
          .setFooter('List users Warns: p>warnings @User')
          .setTimestamp(),
      );

      modLogs.send(
        new MessageEmbed()
          .setTitle('A new Warn has been Added!!')
          .setColor('#7289DA')
          .setDescription(`${warnedUser.username} Has been warned`)
          .addField('Warned by', `${warnedBy.username}`, true)
          .addField('Warned For', `${reasonForWarn}`, true)
          .addField('Number of Warns', `${theUser.numberOfWarns}`)
          .setFooter('List users Warns: p>warnings @User')
          .setTimestamp(),
      );
    } else {
      if (theUser.numberOfWarns > 3) {
        let muteRole = message.guild.roles.cache.get('748977820457238535');

        message.guild.members
          .fetch(message.client.users.cache.find((u) => u.id === warnedUser.id))
          .then((user) => {
            user.roles.add(muteRole);
          });
      }

      if (theUser.numberOfWarns > 6) {
        let kickEmbed = new MessageEmbed()
          .setTitle('User was Kicked!!')
          .setDescription(
            `${warnedUser} has been kicked automatically for receiving a total of 6 Warns`,
          )
          .setColor('#7289DA')
          .setTimestamp();

        let dmEmbed = new MessageEmbed()
          .setTitle('Whoops, To many Warns!!')
          .setDescription(
            `$You have been automatically kicked for receiving a total of 6 Warns, Feel free to read our rules and rejoin.`,
          )
          .setColor('#7289DA')
          .addField(
            'Server Rules',
            '[Click Here](https://paradisebots.net/serverrules)',
            true,
          )
          .addField(
            'Re-Join the Server',
            '[Click Here](https://paradisebots.net/join)',
            true,
          )
          .setTimestamp();

        await warnedUser.send(dmEmbed);

        warnedUser.kick();

        modLogs.send(kickEmbed);
      }

      if (theUser.numberOfWarns > 9) {
        let banEmbed = new MessageEmbed()
          .setTitle('User was Banned!!')
          .setDescription(
            `${warnedUser} has been banned automatically for receiving a total of 9 Warns`,
          )
          .setColor('#7289DA')
          .setTimestamp();

        await warnedUser.ban();

        modLogs.send(banEmbed);
      }

      theUser.userID = warnedUser.id;
      theUser.userName = warnedUser.username;
      theUser.warnedBy = warnedBy.id;
      theUser.warnedByName = warnedBy.username;
      theUser.reasonForWarn = reasonForWarn;
      theUser.numberOfWarns = theUser.numberOfWarns - +-1;
      theUser.recentlyCleared = false;
      await theUser.save();
      message.channel.send(
        new MessageEmbed()
          .setTitle('Action: User Warn')
          .setColor('#7289DA')
          .setDescription(`${warnedUser.username} Has been warned`)
          .addField('Warned by', `${warnedBy.username}`, true)
          .addField('Warned For', `${reasonForWarn}`, true)
          .addField('Number of Warns', `${theUser.numberOfWarns}`)
          .setFooter('List users Warns: p>warnings @User')
          .setTimestamp(),
      );
      modLogs.send(
        new MessageEmbed()
          .setTitle('Warn Count Updated!!')
          .setColor('#7289DA')
          .setDescription(`${warnedUser.username} Has been warned`)
          .addField('Warned by', `${warnedBy.username}`, true)
          .addField('Warned For', `${reasonForWarn}`, true)
          .addField('Number of Warns', `${theUser.numberOfWarns}`)
          .setFooter('List users Warns: p>warnings @User')
          .setTimestamp(),
      );
    }
  } catch (e) {
    let errorEmbed = new MessageEmbed();
    errorEmbed.setTitle('Whoops, Something went wrong!!!');
    errorEmbed.setColor('#7289DA');
    errorEmbed.setDescription(
      'If this issue continues please contact our Dev Team',
    );
    errorEmbed.addField('Error', `${e.message}`);
    errorEmbed.setTimestamp();
    message.channel.send(errorEmbed);
  }
};

module.exports.help = {
  name: 'warn',
  category: 'Bot List',
  aliases: ['strike'],
  description: 'Warn a member of the Paradise Bots Server.',
  example: '``warn @User <reason>``',
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
