const BOTS = require("../models/bots");
const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");
const moment = require("moment");

module.exports.run = async (client, message, args) => {
  message.delete().catch();

  const joke = await fetch("http://api.chucknorris.io/jokes/random")
    .then((response) => response.json())
    .then((body) => body.value);

  let embed = new MessageEmbed()
    .setAuthor(
      "Chuck Norris Joke",
      `https://nakedsecurity.sophos.com/wp-content/uploads/sites/2/2012/01/chuck-norris-thumb.jpg`
    )
    .setDescription(`${joke}`)
    .setFooter(
      `Requested by: ${message.author.username}`,
      message.author.displayAvatarURL
    );
  return message.channel.send(embed);
};

module.exports.help = {
  name: "chuck-norris",
  category: "Fun",
  aliases: ["chuck", "cn"],
  description: "Random Chuck Norris joke.",
  example: "``chuck-norris``",
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
