const BOTS = require("../models/bots")
const { MessageEmbed } = require("discord.js")
const moment = require ('moment');

module.exports.run = async (client , message, args) => {

        message.delete().catch()

        message.channel.send(`${message.author.username} has died.`).then(msg => {
          setTimeout(() => { msg.edit("Respawning..."); }, 1000);
          setTimeout(() => { 

          if(Math.floor(Math.random() * 100) > 50 ){ 

           msg.edit(`Revival complete. Welcome back, ${message.author.username}`);
        } else {

           msg.edit(`Revival Failed, R.I.P ${message.author.username}`);
      }
    }, 3000)
 });
}
 
module.exports.help = {
    name: "kms",
    category: "Fun",
    aliases: ['killme'],
    description: "Kill yourself, with a Revival",
    example: "``kms``"
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
