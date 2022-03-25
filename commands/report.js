const { MessageEmbed, Discord } = require("discord.js");

module.exports.run = async (client, message, args) => {

   message.delete().catch()

    let member = message.mentions.members.first();

    if (message.author.id == member.id) return message.channel.send("Can't report yourself. :x:")

    let reason = args.slice(1).join(" ");

    if (!reason) return message.reply('Please provide a detailed reason why you want to report this user, Provide screenshots if necessary.');

    if (reason.length < 20) return message.reply('Error: Reason cannot be less then 20 Chracters');

    if (message.mentions.users.size < 1) return message.channel.send("Provide a user to report")

    let modlog = message.guild.channels.cache.find(c => c.name === 'reports');

    const embed = new MessageEmbed()
        .setColor(0x00A2E8)
        .setTitle("Action: User Report")
        .addField("Reported By:", message.author.tag + " (ID: " + message.author.id + ")")
        .addField("Reported User:", member.user.username + " (ID: " + member.id + ")")
        .addField("Reason", reason, true)
        .setFooter("Time reported: " + message.createdAt.toDateString())

        if (!modlog) return;

  message.channel.send("User has been reported our staff will contact you if we have further questions.")

  client.channels.cache.get(modlog.id).send({embed});
}

module.exports.help = {
    name: "report",
    category: "Utility",
    aliases: [],
    description: "Report a user to Paradise Staff",
    example: "``report @User <reason>``"
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
