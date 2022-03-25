const { MessageEmbed } = require('discord.js');
module.exports.run = async (client, message, args) => {
  var infoCommands = [
    '``p>help`` - Displays the Help Message for Paradise.',
    '``p>faqs`` - Displays a list of our FAQs and Shows the FAQ Provided',
    '`p>queue`` - Displays a list of bots waiting for approval.',
    '``p>count`` - Displays how many bots are in our list.',
    '``p>api`` - Shows some information and links for our API.',
    '``p>stats`` - Shows you some Statistics for Paradise Bot List and the Management Bot.',
    '``p>ping`` - Displays the Latency and Response time for Paradise not the [Website Ping](status.paradisebots.net).',
    '``p>uptime`` - Displays how long the Website and Bot have been online.',
    '``p>partners`` - Shows you some information and links regarding our Partner Program',
    '``p>certificaiton`` - Shows you some information and links regarding our Cerification Program',
    '``p>subscribe`` - Subscribe to the Update Pings role to be notified about updates',
    '``p>unsubscribe`` - UnSubscribe from the Update Pings role to stop being notified about updates',
  ];

  var modCommands = [
    '``p>ban`` - Bans the mentioned user.',
    '``p>warn`` - Warn a member of our server.',
    '``p>warns`` - Displays how many warnings the provided user has received',
    '``p>mute`` - Mute the mentioned user.',
    '``p>unmute`` - Unmute the mentioned user.',
    '``p>clear`` - Clear messages from the current chat (Provide an amount or let it Default)',
  ];

  var listCommands = [
    '``p>botinfo`` - Displays some information about the mentioned bot if it is on our Website.',
    '``p>bots`` - Displays some information about bots the mentioned user has added. (Defaults to message author if no User is mentioned)',
    '``p>widget`` - Shows an Embed or Widget for the mentioned bot that can be Shared or added to a Website',
  ];

  var approverCommands = [
    '``p>verify`` - Verify/Approve the provided bot.',
    '``p>remove`` - Remove/Delete the provided bot from our site | Can be resubmitted (**COMING SOON**)',
  ];

  var funCommands = [
    '``p>chuck-norris`` - Random Chuck Norris joke.',
    '``p>kms`` - Kill yourself, With a revive ;).',
  ];

  var trustedCommands = [
    '``p>snipe`` - Show recently deleted messages ;).',
    '``p>eval`` - Evaluate some code.',
    '``p>embed`` - Send a message as an embed',
    '``p>certify`` - Certify the bot provided',
    '``p>uncertify`` - Uncertify the bot provided',
    '``p>partner`` - Partner the bot provided',
    '``p>unpartner`` - UnPartner the bot provided',
    '``p>voteban`` - Vote ban the bot provided',
    '``p>novoteban`` - Un vote ban the bot provided',
  ];

  var memeCommands = [
    '``p>meme`` - Generates a random meme from the Dank Memes subreddit.',
  ];

  message.delete().catch();

  try {
    let prefix = 'p>';

    const sent = new MessageEmbed();
    sent.setTitle('Commands Sent');
    sent.setDescription(
      `<@${message.author.id}> Commands have been sent, Please check your DMs.`,
    );
    sent.setTimestamp();
    sent.setFooter('© Paradise Bots | 2020', 'https://i.imgur.com/Df2seyl.png');

    const hiddenSent = new MessageEmbed();
    hiddenSent.setAuthor('Okay then!!', 'https://i.imgur.com/Df2seyl.png');
    hiddenSent.setDescription(`<@${message.author.id}> Check your DMs`);
    hiddenSent.setTimestamp();
    hiddenSent.setFooter(
      '© Paradise Bots | 2020',
      'https://i.imgur.com/Df2seyl.png',
    );

    const cant = new MessageEmbed();
    cant.setAuthor('Whoops, Error', 'https://i.imgur.com/Df2seyl.png');
    cant.setDescription(
      'Please make sure you are allowing DMs from Server Members.',
    );
    cant.setTimestamp();
    cant.setFooter('© Paradise Bots | 2020', 'https://i.imgur.com/Df2seyl.png');

    const embed = new MessageEmbed();
    embed.setAuthor('Paradise Help Command', 'https://i.imgur.com/Df2seyl.png');
    embed.setDescription('Here is a list of my available Command Modules.');
    embed.addField('Help Usage', `${prefix}help <moduleName>`);
    embed.addField('Usage Example', `${prefix}help info`);
    embed.addField(
      'Full List',
      '[Commands List](https://paradisebots.net/bots/727779650738323497)',
    );
    embed.addField(
      'Available Modules',
      '• approvers - Commands for our Approvers!! \n• info - Information and Help commands. \n• fun - Fun commands.\n• memes - Meme commands.\n• mod - Moderation commands.\n• list - Commands used to interact with our Bot List.',
    );
    embed.setTimestamp();
    embed.setFooter(
      '© Paradise Bots | 2020',
      'https://i.imgur.com/Df2seyl.png',
    );

    const embed2 = new MessageEmbed();
    embed2.setAuthor(
      'Paradise Help Command | Approvers',
      'https://i.imgur.com/Df2seyl.png',
    );
    embed2.addField(
      'Approver Only',
      '• p>trusted - Commands locked to Approvers/Trusted Members',
    );
    embed2.addField(
      'Dev Note',
      'You have been DMed this message because it contains a command module that is Locked and unavailable to Normal Members',
    );
    embed2.setTimestamp();
    embed2.setFooter(
      '© Paradise Bots | 2020',
      'https://i.imgur.com/Df2seyl.png',
    );

    if (!args[0] && client.config.owners.includes(message.author.id)) {
      await message.channel.send(embed);
      //await message.channel.send(hiddenSent)
      return message.author.send(embed2);
    } else if (!args[0]) {
      return message.channel.send(embed);
    }

    if (args[0] && client.commands.has(args[0])) {
      const cmd = client.commands.get(args[0]);
      let cmdname =
        cmd.help.name.charAt(0).toUpperCase() + cmd.help.name.slice(1);
      let aliases = 'No aliases for that command';
      if (cmd.help.aliases.length === 0) {
        aliases = 'No aliases for that command';
      } else {
        aliases = cmd.help.aliases.join('\n');
      }
      const embed = new MessageEmbed()
        .setAuthor(`${cmdname} command`)
        .setColor('GREEN')
        .setDescription(
          `**Prefix:** ${prefix}\n**Name:** ${cmd.help.name}\n**Description:** ${cmd.help.description}\n**Category:** ${cmd.help.category}`,
        )
        .addField('Examples', cmd.help.example)
        .addField('Aliases', '``' + aliases + '``')
        .setFooter(`Syntax: <> = required, [] = optional`);
      return message.channel.send(embed);
    }

    if (args[0] === 'approvers') {
      const embed3 = new MessageEmbed();
      embed3.setTitle('Approver Commands');
      embed3.setDescription(approverCommands);
      embed3.setTimestamp();
      embed3.setFooter(
        '© Paradise Bots | 2020',
        'https://i.imgur.com/Df2seyl.png',
      );

      message.author
        .send(embed3)
        .then(() => message.channel.send(sent))
        .catch(() => message.channel.send(cant));
    } else if (args[0] === 'info') {
      const embed3 = new MessageEmbed();
      embed3.setTitle('Information Commands');
      embed3.setDescription(infoCommands);
      embed3.setTimestamp();
      embed3.setFooter(
        '© Paradise Bots | 2020',
        'https://i.imgur.com/Df2seyl.png',
      );

      message.author
        .send(embed3)
        .then(() => message.channel.send(sent))
        .catch(() => message.channel.send(cant));
    } else if (args[0] === 'mod') {
      const embed4 = new MessageEmbed();
      embed4.setTitle('Moderation Commands');
      embed4.setDescription(modCommands);
      embed4.setTimestamp();
      embed4.setFooter(
        '© Paradise Bots | 2020',
        'https://i.imgur.com/Df2seyl.png',
      );

      message.author
        .send(embed4)
        .then(() => message.channel.send(sent))
        .catch(() => message.channel.send(cant));
    } else if (args[0] === 'list') {
      const embed5 = new MessageEmbed();
      embed5.setTitle('Bot List Commands');
      embed5.setDescription(listCommands);
      embed5.setTimestamp();
      embed5.setFooter(
        '© Paradise Bots | 2020',
        'https://i.imgur.com/Df2seyl.png',
      );

      message.author
        .send(embed5)
        .then(() => message.channel.send(sent))
        .catch(() => message.channel.send(cant));
    } else if (args[0] === 'fun') {
      const embed7 = new MessageEmbed();
      embed7.setTitle('Fun Commands');
      embed7.setDescription(funCommands);
      embed7.setTimestamp();
      embed7.setFooter(
        '© Paradise Bots | 2020',
        'https://i.imgur.com/Df2seyl.png',
      );

      message.author
        .send(embed7)
        .then(() => message.channel.send(sent))
        .catch(() => message.channel.send(cant));
    } else if (args[0] === 'memes') {
      const embed8 = new MessageEmbed();
      embed8.setTitle('Meme Commands');
      embed8.setDescription(memeCommands);
      embed8.setTimestamp();
      embed8.setFooter(
        '© Paradise Bots | 2020',
        'https://i.imgur.com/Df2seyl.png',
      );

      message.author
        .send(embed8)
        .then(() => message.channel.send(sent))
        .catch(() => message.channel.send(cant));
    } else if (args[0] === 'trusted') {
      const no = new MessageEmbed();
      no.setTitle('You cant do that');
      no.setDescription('You dont have permissions to view this module');
      no.setTimestamp();
      no.setFooter('© Paradise Bots | 2020', 'https://i.imgur.com/Df2seyl.png');

      if (!client.config.owners.includes(message.author.id))
        return message.channel.send(no);

      const embed6 = new MessageEmbed();
      embed6.setTitle('Hidden Commands');
      embed6.setDescription(trustedCommands);
      embed6.setTimestamp();
      embed6.setFooter(
        '© Paradise Bots | 2020',
        'https://i.imgur.com/Df2seyl.png',
      );

      message.author
        .send(embed6)
        .then(() => message.channel.send(sent))
        .catch(() => message.channel.send(cant));
    } else {
      message.channel.send('You did not select a valid option');
    }
  } catch (e) {
    var embed2 = new MessageEmbed();
    embed2.setTitle('Whoops, Something went wrong!!!');
    embed2.setColor('#7289DA');
    embed2.setDescription(
      'If this issue continues please contact our Dev Team',
    );
    embed2.addField('Error', `${e.message}`);
    embed2.setTimestamp();

    return message.channel.send(embed2);
  }
};

module.exports.help = {
  name: 'help',
  category: 'info',
  aliases: ['commands', 'cmds'],
  description: 'Send you all commands!',
  example: '``help``\n``help <command_name>``',
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
