const { Client, MessageEmbed } = require('discord.js');
const client = new Client({
  disableEveryone: true,
  disabledEvents: ['TYPING_START'],
});

client.on('ready', () => {
  console.log(`Paradise Anti-Invite is ready`);
});

client.on('message', async (message) => {
  if (message.author.bot) return;
  if (message.channel.type != 'text') return;
  if (!message.guild.member(client.user).hasPermission('SEND_MESSAGES')) return;
  if (!message.guild.member(client.user).hasPermission('MANAGE_MESSAGES'))
    return;
  if (!message.guild.member(client.user).hasPermission('EMBED_LINKS')) return;
  if (!message.guild.member(client.user).hasPermission('VIEW_CHANNEL')) return;
  if (!message.guild.member(client.user).hasPermission('READ_MESSAGE_HISTORY'))
    return;
  if (message.member.hasPermission('ADMINISTRATOR')) return;

  const prefix = 'p>';
  const args = message.content.slice(prefix.length).trim().split(/ +/g);

  if (message.content.includes('')) {
    const check1 = args.join(' ');

    const guildID = '748977820457238530';

    if (check1.includes('.')) return;

    var hasDuplicates = /([a-zA-Z])\1+$/;

    const result = hasDuplicates.test(check1);

    if (result === true) {
      message.delete().catch();

      let logEmbed = new MessageEmbed();
      logEmbed.setTitle('Action: Auto Moderation');
      logEmbed.setColor('#758acf');
      logEmbed.addField(
        'Moderator',
        client.user.username + ' (ID: ' + client.user.id + ')',
      );
      logEmbed.addField(
        'User',
        message.author.username + ' (ID: ' + message.author.id + ')',
      );
      logEmbed.addField('Channel', message.channel.name, true);
      logEmbed.addField('Reason', 'Spam Detection', true);
      logEmbed.addField('Message Count', message.cleanContent);
      logEmbed.setFooter('Time Used: ' + message.createdAt.toDateString());

      const modLogs = await client.guilds.cache
        .get(guildID)
        .channels.cache.find((c) => c.name === 'mod-logs')
        .send(logEmbed);

      if (!modLogs) return;

      let user = message.guild.member(message.mentions.users.first());

      let noSpam = new MessageEmbed();
      noSpam.setTitle('Duplicated Characters');
      noSpam.setDescription(
        `<@${message.author.id}> Quit spamming nonsense in my server!!!!`,
      );
      noSpam.setTimestamp();

      message.author.send(noSpam);
    }
  }
});

//client.login(process.env.token);
