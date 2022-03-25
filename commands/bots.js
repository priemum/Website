const BOTS = require("../models/bots")
const { MessageEmbed } = require("discord.js")
const moment = require ('moment');

module.exports.run = async (client , message, args) => {

        message.delete().catch()

     try {

        let user = message.mentions.users.first() 
       
        if (!user) user = client.users.cache.get(args[0]);

        if (!args[0]) return message.channel.send("Ping a user or provide a User ID")

        if (user.bot) return;

        let msg = "";
        let msg2 = "";
        let msg3 = "";
        let msg4 = "";
        let bots = await BOTS.find({ owner: user.id, status: "approved" }, { _id: false });
        let bots2 =  await BOTS.find({ owner: user.id, status: "pending" }, { _id: false });
        let bots3 =  await BOTS.find({ owner: user.id, status: "denied" }, { _id: false });
        let bots4 = await BOTS.find({ additionalOwners: user.id, status: "approved" }, {_id: false });

        if (bots.length === 0) {
            msg = "No approved bots";
        }else{
            bots.forEach(bot => {
                msg += `<@${bot.botid}>\n`
            })
        }

        if (bots2.length === 0) {
            msg2 = "No pending bots";
        }else{
            bots2.forEach(bot => {
                msg2 += `<@${bot.botid}>\n`
            })
        }

        if (bots3.length === 0) {
            msg3 = "No denied bots";
        }else{
            bots3.forEach(bot => {
                msg3 += `<@${bot.botid}>\n`
            })
        }

       if (bots4.length === 0) {
            msg4 = "No Approved Team Bots";
        }else{
            bots4.forEach(bot => {
                msg4 += `<@${bot.botid}>\n`
            })
        }


        message.channel.send(new MessageEmbed()
            .setTitle(`${user.username}#${user.discriminator}'s bots`)
            .addField("Approved Bots", msg, true)
            .addField("Pending Bots", msg2, true)
            .addField("Denied Bots", msg3, true)
            .addField("Team Bots (Additional Owner)", msg4, true)
            .setColor(0x6b83aa))
    } catch (e) {

        var embed2 = new MessageEmbed()
            embed2.setTitle('Whoops, Something went wrong!!!')
            embed2.setColor('#7289DA')
            embed2.setDescription("If this issue continues please contact our Dev Team")
            embed2.addField("Error", `${e.message}`)
            embed2.setTimestamp()

        return message.channel.send(embed2);
  }
}

module.exports.help = {
    name: "bots",
    category: "info",
    aliases: ['user-bots'],
    description: "Provides some information about what bots the provided user owns or has been added to as an Additional Owner",
    example: "``botinfo <@bot>``"
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
