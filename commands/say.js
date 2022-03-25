const BOTS = require("../models/bots");
const { MessageEmbed } = require('discord.js');

module.exports.run = async (client, message, args) => {

    message.delete().catch()

  const word = args.join(" ")
  if (word < 1) return message.channel.send("Really though -_-, You didn't provide something to say, NOOB!!!!!!")

     message.channel.send(word)

    }

module.exports.help = {
    name: "say",
    category: "Info",
    aliases: ['send', 'talk'],
    description: "Send a message",
    example: "``send <Message Here>``"
}

module.exports.requirements = {
    userPerms: [],
    clientPerms: ["EMBED_LINKS"],
    ownerOnly: false
}

module.exports.limits = {
    rateLimit: 2,
    cooldown: 1e4
}
