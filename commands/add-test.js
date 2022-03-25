const BOTS = require("../models/bots");
const { MessageEmbed } = require('discord.js');

module.exports.run = async (client, message, args) => {

    message.delete().catch()

    try {

    await client.emit('guildMemberAdd', message.member);

        var embed = new MessageEmbed()
            embed.setTitle('Event Emited Successfully')
            embed.setColor('#7289DA')
            embed.setDescription("The `guildMemberAdd` event has been emited, Check the welcome channel.")
            embed.setTimestamp()
  
            message.channel.send(embed)

    } catch (e) {


        var embed2 = new MessageEmbed()
            embed2.setTitle('Emitting was Unsuccessful')
            embed2.setColor('#7289DA')
            embed2.setDescription("Failed to emit the guildMemberAdd event")
            embed2.addField("Error", `${e.message}`)
            embed2.setTimestamp()

        return message.channel.send(embed2);
    }
}

module.exports.help = {
    name: "add-test",
    category: "Info",
    aliases: [],
    description: "Emit a guildMemberAdd test event",
    example: "``add-test``"
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
