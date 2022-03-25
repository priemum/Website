const BOTS = require("../models/bots")
const { MessageEmbed } = require("discord.js")
const moment = require ('moment');
const fetch = require('node-fetch');

module.exports.run = async (client , message, args) => {

        message.delete().catch()

        let user = message.mentions.users.first();
        if (!user || !user.bot) return message.channel.send(`You didn't ping a bot to get a widget of.`);
        let url = `https://paradisebots.net/bots/${user.id}/widget`
        let img = await fetch(url).then(res => res.buffer());
        message.channel.send({ files: [img] });
}

module.exports.help = {
    name: "widget",
    category: "info",
    aliases: ['embed'],
    description: "Sends the widget for the Bot Provided",
    example: "``widget <@bot>``"
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
