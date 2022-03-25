const BOTS = require("../models/bots")
const { MessageEmbed } = require("discord.js")
module.exports.run = async (client , message, args) => {

        message.delete().catch()

        let msg = "";
        let bots = await BOTS.find({ status: "pending" }, { _id: false })

        if (bots.length === 0) {
            msg = "There are currently no bots in our queue, You can add one [here](https://paradisebots.net/add)";
        }else{
            bots.forEach(bot => {
                let botUsername = client.users.cache.get(bot.id)
                msg += ` • ${bot.username} | [Invite](https://discord.com/oauth2/authorize?client_id=${bot.botid}&scope=bot&guild_id=${process.env.GUILD_ID}&permissions=0)\n`
            })
        }

        message.channel.send(new MessageEmbed()
            .addField("Bots in Queue", msg)
            .setColor(0x6b83aa))
    }

module.exports.help = {
    name: "queue",
    category: "info",
    aliases: ['q', 'pending'],
    description: "Provides a list of bots awaiting our approval",
    example: "``queue``"
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
