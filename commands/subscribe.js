const BOTS = require("../models/bots");
const { MessageEmbed } = require("discord.js");
const config = require("../config.js");

module.exports.run = async (client, message, args) => {
  message.delete().catch();

  let user = client.guilds.cache
    .get(config.guildid)
    .members.cache.get(message.author.id);

  let updatePings = client.guilds.cache
    .get(config.guildid)
    .roles.cache.get("748977820776267867");

  let giveawayPings = client.guilds.cache
    .get(config.guildid)
    .roles.cache.get("781419158323593247");

  let appPings = client.guilds.cache
    .get(config.guildid)
    .roles.cache.get("781419060721877013");

  let roleToSub = args.slice(0).join(" ");

  let subHelp = new MessageEmbed();
  subHelp.setTitle("Self Assignable Roles");
  subHelp.setColor("#7289DA");
  subHelp.setDescription(
    "Not everyone is a fan of pings, Due to this fact we will not ping here or everyone with updates. If you want to subscribe to be notified please choose a role to subscribe to."
  );
  subHelp.addField(
    "Server Updates",
    "Name: updates\nDescription: Get notified about Server, API and Website Updates\nUsage: `p>sub updates",
    true
  );
  subHelp.addField(
    "Giveaway Updates",
    "Name: giveaways\nDescription: Get notified about in Server events and giveaways\nUsage: `p>sub giveaways",
    true
  );
  subHelp.addField(
    "Application Updates",
    "Name: applications\nDescription: Get notified when we open Staff Applications\nUsage: p>sub applications ",
    true
  );
  subHelp.setFooter("Usage: p>sub <Name>");

  if (!roleToSub) return message.channel.send(subHelp);

  if (roleToSub === "updates") {
    let successEmbed = new MessageEmbed();
    successEmbed.setTitle("Subscription Successful");
    successEmbed.setColor("#7289DA");
    successEmbed.setDescription(
      "You have subscribed for Server, Website and API Updates."
    );
    successEmbed.setTimestamp();

    await user.roles.add(updatePings);

    message.channel.send(successEmbed);
  } else if (roleToSub === "giveaways") {
    let successEmbed = new MessageEmbed();
    successEmbed.setTitle("Subscription Successful");
    successEmbed.setColor("#7289DA");
    successEmbed.setDescription("You have subscribed for Giveaway Updates.");
    successEmbed.setTimestamp();

    await user.roles.add(giveawayPings);

    message.channel.send(successEmbed);
  } else if (roleToSub === "applications") {
    let successEmbed = new MessageEmbed();
    successEmbed.setTitle("Subscription Successful");
    successEmbed.setColor("#7289DA");
    successEmbed.setDescription(
      "You have subscribed for Updates regarding our Staff Applications"
    );
    successEmbed.setTimestamp();

    await user.roles.add(appPings);

    message.channel.send(successEmbed);
  } else {
    let noValid = new MessageEmbed();
    noValid.setTitle("Whoops, Thats not right!!");
    noValid.setDescription(
      "You didnt provide a valid option, Please choose one of the options provided."
    );
    noValid.setTimestamp();
    noValid.setFooter(`Requested By: ${message.author.username}`);

    return message.channel.send(noValid);
  }
};

module.exports.help = {
  name: "subscribe",
  category: "Info",
  aliases: ["sub"],
  description: "Self assignable roles, provide no params for help.",
  example: "``subscribe``",
};

module.exports.requirements = {
  userPerms: [],
  clientPerms: ["EMBED_LINKS"],
  ownerOnly: false,
};

module.exports.limits = {
  rateLimit: 2,
  cooldown: 1e4,
};
