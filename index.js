require('sqreen');

const { Client, MessageEmbed, Collection } = require('discord.js');
const config = require('./config.js');
const client = new Client({
  disableMentions: 'everyone',
  disabledEvents: ['TYPING_START'],           
});

client.commands = new Collection();
client.aliases = new Collection();
client.limits = new Map();
client.snipeMap = new Map();
client.config = config;

require('./automation/antiInvite');

const Auditlog = require('discord-auditlog');
// will send all event to #audit-logs channel
// will send movement (join/leave) to #in-out channel if the channel exist
Auditlog(client, {
  '748977820457238530': {
    auditlog: 'bot-hell',
    movement: 'welcome-bot-logs',
    auditmsg: 'bot-hell', // Default to fasle, recommend to set a channel
    voice: false, // Set a Channel name if you want it
    trackroles: true, // Default is False
    // excludedroles: ['671004697850544111', '671004697850544112']  // This is an OPTIONAL array of Roles ID that won't be tracked
  },
});

client.embedConfig = {
  embedColor: '#7289DA',
  embedLogo: 'https://i.imgur.com/Df2seyl.png',
};

client.on('ready', () => {
  console.log(`Paradise is online and ready`);
  server = client.guilds.cache.get(process.env.guildid);
});

const command = require('./structures/command');
command.run(client);

const events = require('./structures/event');
events.run(client);

client.login(config.token);
