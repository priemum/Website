const BOTS = require("../models/bots");
const { MessageEmbed } = require('discord.js');

module.exports.run = async (client, message, args) => {

    message.delete().catch()

        var embed = new MessageEmbed()
            embed.setTitle('Paradise Bots Certification Program')
            embed.setColor('#7289DA')
            embed.setDescription('Interested in Getting your bot certifed? Heres some info')
            embed.addField('Requirements and Info', '[Available on our Docs](https://docs.paradisebots.net/internal/community/certification/)')
            embed.setTimestamp()
            embed.setFooter('© Paradise Bots | 2020', 'https://i.imgur.com/Df2seyl.png')

            message.channel.send(embed)

    }

module.exports.help = {
    name: "certification",
    category: "Info",
    aliases: ['certified', 'get-certified', 'cert', 'cert-info'],
    description: "Get some useful links to find info about our Certification Program.",
    example: "``certified``"
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
