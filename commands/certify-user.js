const USERS = require("../models/users");
const { MessageEmbed } = require('discord.js');

module.exports.run = async (client, message, args, guild) => {

    message.delete().catch()

  try {

     let user = (message.mentions.users.first() || client.users.cache.get(args[0]));

     const modLog = message.guild.channels.cache.find(channel => channel.name === 'website-logs');

     const certifiedDevRole = message.guild.roles.cache.get('759599781487181865');


    if (!user || user.bot) return message.channel.send(`Ping a **user**.`);

        let userToCert = await USERS.findOne({userID: user.id}, { _id: false })

        if (userToCert.certifiedUser) {
          
          let embed = new MessageEmbed()
            .setTitle('Whoaa, Cant do that.')
            .setDescription(`${user.username} Has already been Certified.`)
            .setTimestamp()
            .setColor(0x26ff00)
          
          return message.channel.send(embed)
        } else {
          message.delete().catch()
        await USERS.updateOne({ userID: user.id }, {$set: { certifiedUser: true }})
        let e = new MessageEmbed()
            .setTitle('User Certified')
            .addField(`User`, `<@${user.id}>`, true)
            .addField("Mod", message.author, true)
            .setTimestamp()
            .setColor(0x26ff00)
        modLog.send(e);

        message.guild.members.fetch(message.client.users.cache.find(u => u.id === user.id)).then(theUser => {
            theUser.roles.add(certifiedDevRole)
        })
          
          let e2 = new MessageEmbed()
            .setTitle('User was Certified')
            .addField(`User`, `${user.username}`, true)
            .setTimestamp()
            .setColor(0x26ff00)
        //message.channel.send(`Certified \`${user.username}\``);
          message.channel.send(e2)
     }
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
    name: "certify-user",
    category: "Bot List",
    aliases: [],
    description: "Certify the provided user, Provides perks on the site.",
    example: "``certify-user <@user>``"
}

module.exports.requirements = {
    userPerms: [],
    clientPerms: ["EMBED_LINKS"],
    higherOnly: true
}

module.exports.limits = {
    rateLimit: 2,
    cooldown: 1e4
}
