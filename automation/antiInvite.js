const { Client, MessageEmbed } = require('discord.js');
const client = new Client({
  disableEveryone: true,
  disabledEvents: ['TYPING_START'],
});

client.on('ready', () => {
  console.log(`Paradise Anti-Invite is ready`);
  server = client.guilds.cache.get(process.env.guildid);
});

client.on('message', async (message) => {
  let user = message.author;

  if (message.content.includes('discord.gg/' || 'discordapp.com/invite/')) {
    //if it contains an invite link

    if (message.member.hasPermission('ADMINISTRATOR')) return;

    if (
      message.channel.name === '┊partner-ads' ||
      message.channel.name === '┊self-promo'
    )
      return;

    if (message.channel.name.includes('ticket-')) return;

    if (message.guild.id === '748977820457238530') {
      if (message.member.hasPermission('ADMINISTRATOR')) return;

      await message.delete().catch();

      let user = message.author;

      const modLogs = message.guild.channels.cache.find(
        (channel) => channel.name === 'mod-logs',
      );

      let logEmbed = new MessageEmbed();
      logEmbed.setTitle('Advertising Prevention');
      logEmbed.setDescription(`${user} Has been Muted`);
      logEmbed.addField(
        'Reason',
        'Advertising or Sharing Discord/Discord Server links outside of our Partnership Program.',
      );
      logEmbed.setTimestamp();

      let userEmbed = new MessageEmbed();
      userEmbed.setTitle('LOL Nice Try Though');
      userEmbed.setDescription(`You have been muted`);
      userEmbed.addField(
        'Reason',
        'Advertising of Server Links is allowed by Partnered members only',
      );
      userEmbed.addField('Appeal', 'Contact either a Head Admin or Owner');
      userEmbed.setTimestamp();

      await user.send(userEmbed);

      let mutedRole = message.guild.roles.cache.get('748977820457238535');

      message.guild.member(user).roles.add(mutedRole);

      modLogs.send(logEmbed);
    }
  }
});

client.login(process.env.token);
