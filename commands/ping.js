const BOTS = require("../models/bots");
const { MessageEmbed } = require('discord.js');

module.exports.run = async (client, message, args) => {

    message.delete().catch()

        var apiMessage = new MessageEmbed()
            apiMessage.setAuthor('Ping 🏓', 'https://i.imgur.com/Df2seyl.png')
            apiMessage.setColor('#7289DA')
            apiMessage.setDescription(`Pong: ${client.ws.ping}ms`)
            apiMessage.setTimestamp()
            apiMessage.setFooter('© Paradise Bots | 2020', 'https://i.imgur.com/Df2seyl.png')

            message.channel.send(apiMessage)

    }

module.exports.help = {
    name: "ping",
    category: "Info",
    aliases: ['pong'],
    description: "Shows Latency and Response Time",
    example: "``ping``"
}

module.exports.requirements = {
    userPerms: [],
    clientPerms: ["EMBED_LINKS"],
    ownerOnly: true
}

module.exports.limits = {
    rateLimit: 2,
    cooldown: 1e4
}
