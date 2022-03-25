const BOTS = require("../models/bots");
const { MessageEmbed } = require('discord.js');

module.exports.run = async (client, message, args) => {

    message.delete().catch()

       let partnerSupport = message.guild.channels.cache.find(channel => channel.id === '762752168284913705');

        var embed = new MessageEmbed()
            embed.setTitle('Paradise Partnership Program')
            embed.setColor('#7289DA')
            embed.setDescription('Interestd in joining our Partner Program?, or just looking for some more info? Here is some useful info and links to get you started')
            embed.addField('Our Partners', '[Partner Page](https://paradisebots.net/partners)', true)
            embed.addField('Documentation', '[Docs Site](https://docs.paradisebots.net/community/partnership)', true)
            embed.addField('Partner Applications', '[Apply Here](https://paradisebots.net/apps/partner)', true)
            embed.addField('Partner Support', `Found in the ${partnerSupport} channel.`, true)
            embed.setTimestamp()
            embed.setFooter('© Paradise Bots | 2020', 'https://i.imgur.com/Df2seyl.png')

            message.channel.send(embed)

    }

module.exports.help = {
    name: "partners",
    category: "Info",
    aliases: [],
    description: "Shows you some info about our Partner Program",
    example: "``partners``"
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
