const { Client, MessageEmbed } = require("discord.js");
const client = new Client({
  disableEveryone: true,
  disabledEvents: ["TYPING_START"],
});

var schedule = require("node-schedule");

const guildID = "748977820457238530";
const logChan = "762837188625825812";
var server = "";
var counter = [];

// number of 'heavy' actions a staff can do in time limit before setting
// them to cooldown
const actionsLimit = 3;

const cooldownRoleID = "748977820457238535"; // Muted or Cooldown
const staffRoleID = "748977820776267870"; // Bot Approvers

client.on("ready", async () => {
  console.log(`Paradise Server Automation is ready`);
  server = await client.guilds.cache.get(guildID);
});

// debug function; remove before launch
/*client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong');
    console.log(counter)
  }
});*/

//
// COUNTER TRIGGERS
//

// after deleting a channel
client.on("channelDelete", (channel) => {
  console.log("Channel delete detected.");
  server
    .fetchAuditLogs()
    .then((audit) => updateCounter(audit.entries.first().executor.username));
});

// after deleting a message
client.on("messageDelete", (message, channel) => {
  console.log("Message delete detected.");
  server
    .fetchAuditLogs()
    .then((audit) => updateCounter(audit.entries.first().executor.id));
});

// after banning a user
client.on("guildBanAdd", (user) => {
  console.log("Ban detected.");
  server
    .fetchAuditLogs()
    .then((audit) => updateCounter(audit.entries.first().executor.id));
});

// after editing a role
client.on("roleUpdate", (user) => {
  console.log("Role update detected.");
  server
    .fetchAuditLogs()
    .then((audit) => updateCounter(audit.entries.first().executor.id));
});

// after deleting a role
client.on("roleDelete", (user) => {
  console.log("Role delete detected.");
  server
    .fetchAuditLogs()
    .then((audit) => updateCounter(audit.entries.first().executor.id));
});

// after kicking a user
client.on("guildMemberRemove", (user) => {
  console.log("Message remove/kick detected.");
  server
    .fetchAuditLogs()
    .then((audit) => updateCounter(audit.entries.first().executor.id));
});

function updateCounter(user) {
  // increments user's delete count by 1 if user exists in list
  if (counter[user] != null) {
    counter[user] = counter[user] + 1;
    checkForSpam(user);
  }

  // creates entry for user if user isn't currently in list
  else {
    counter[user] = 1;
  }
}

function checkForSpam(userID) {
  // console.log(server.members)
  // console.log(counter[client.guilds.cache.get(guildID).members.cache.get(userID))
  if (counter[userID] > actionsLimit) {
    console.log("test");

    client.guilds.cache
      .get(guildID)
      .members.cache.get(userID)
      .roles.add(cooldownRoleID)
      .then(console.log(userID + "is on cooldown!"));

    client.guilds.cache
      .get(guildID)
      .members.cache.get(userID)
      .roles.remove(staffRoleID)
      .then(console.log(userID + "'s mod powers are stripped'!"));
  }
}

//
// TIMERS
//
const ALERT_FREQUENCY = "0,8,10,20,30,40,50 * * * *"; // default every 15 mins

var resetCounter = schedule.scheduleJob(ALERT_FREQUENCY, function () {
  for (var user in counter) {
    counter[user] = 0;
  }
  console.log("Action counters back to 0.");
});

//client.login(process.env.token);
