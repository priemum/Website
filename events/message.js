const mongoose = require('mongoose');
const ms = require('parse-ms');
const { MessageEmbed } = require('discord.js');
const ratetime = new Set();

mongoose.connect(
  'mongodb://admin:XclUd5hhWSJDU4Nl@SG-ParadiseBotList-35989.servers.mongodirector.com:27017/admin',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) return console.error(err);
    console.log('MONGODB IS CONNECTED');
  },
);

module.exports = (client, message) => {
  if (message.author.bot) return;

  let pingMsg = new MessageEmbed();
  pingMsg.setDescription('My prefix is `p>` | Example: `p>help`');
  if (
    message.content === `<@${client.user.id}>` ||
    message.content === `<@!${client.user.id}>`
  )
    return message.channel.send(pingMsg);

  let prefix = 'p>';
  const args = message.content.split(/ +/g);
  const commands = args.shift().slice(prefix.length).toLowerCase();
  const cmd = client.commands.get(commands) || client.aliases.get(commands);

  if (!message.content.toLowerCase().startsWith(prefix)) return;

  if (!cmd) return;
  if (
    !message.channel
      .permissionsFor(message.guild.me)
      .toArray()
      .includes('SEND_MESSAGES')
  )
    return;

  let ownerEmbed = new MessageEmbed();
  ownerEmbed.setTitle('Lacking Permissions ❌');
  ownerEmbed.setDescription(
    'Okay noob You dont have permission to use this command!!',
  );

  if (
    cmd.requirements.ownerOnly &&
    !client.config.owners.includes(message.author.id)
  )
    return message.channel.send(ownerEmbed);

  let higherStaffMsg = new MessageEmbed();
  higherStaffMsg.setTitle('Lacking Permissions ❌');
  higherStaffMsg.setDescription(
    'Okay noob You dont have permission to use this command!!',
  );

  if (
    cmd.requirements.higherOnly &&
    !client.config.higherStaff.includes(message.author.id)
  )
    return message.channel.send(higherStaffMsg);

  let embed = new MessageEmbed()
    .setAuthor('Lacking Permissions ❌', message.author.displayAvatarURL())
    .addField(
      `You are missing those permissions`,
      missingPerms(message.member, cmd.requirements.userPerms),
    )
    .setFooter(client.user.tag);
  if (
    cmd.requirements.userPerms &&
    !message.member.permissions.has(cmd.requirements.userPerms)
  )
    return message.channel.send(embed);

  let embed1 = new MessageEmbed()
    .setAuthor('Lacking Permissions ❌', client.user.displayAvatarURL())
    .addField(
      `I am missing those permissions`,
      missingPerms(message.guild.me, cmd.requirements.clientPerms),
    )
    .setFooter(client.user.tag);
  if (
    cmd.requirements.clientPerms &&
    !message.guild.me.permissions.has(cmd.requirements.clientPerms)
  )
    return message.channel.send(embed1);

  if (cmd.limits) {
    const current = client.limits.get(`${commands}-${message.author.id}`);
    if (!current) client.limits.set(`${commands}-${message.author.id}`, 1);
    else {
      if (current >= cmd.limits.rateLimit) {
        let timeout = ms(
          cmd.limits.cooldown -
            (Date.now() - ratetime[message.author.id + commands].times),
        );
        return message.reply(
          'Ratelimit , You need to wait ' +
            '``' +
            `${timeout.hours}h ${timeout.minutes}m ${timeout.seconds}s` +
            '``',
        );
      }
      client.limits.set(`${commands}-${message.author.id}`, current + 1);
      ratetime.add(message.author.id + commands);
      ratetime[message.author.id + commands] = {
        times: Date.now(),
      };
    }
    setTimeout(() => {
      client.limits.delete(`${commands}-${message.author.id}`);
      ratetime.delete(message.author.id + commands);
    }, cmd.limits.cooldown);
  }

  try {
    cmd.run(client, message, args);
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

const missingPerms = (member, perms) => {
  const missingPerms = member.permissions.missing(perms).map(
    (str) =>
      `\`${str
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b(\w)/g, (char) => char.toUpperCase())}\``,
  );

  return missingPerms.length > 1
    ? `${missingPerms.slice(0, -1).join(', ')} and ${missingPerms.slice(-1)[0]}`
    : missingPerms[0];
};
