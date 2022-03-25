const { MessageEmbed } = require ('discord.js');
const Users = require ('../models/users');

module.exports.run = async (client, message, args, prop, data) => {

    try {

    message.delete().catch()

    let user = (message.mentions.users.first() || client.users.cache.get(args[0]));

    if (!user || user.bot) return message.channel.send('Ping a user or provide a valid ID');

    let isUser = await Users.findOne({ userID: user.id }, { _id: false });

    if (isUser.staff) {

        return message.channel.send('User is already a active Staff Member!');

    } else {

        await Users.updateOne({ userID: user.id}, {$set: { staff: true }});

        const embed = new MessageEmbed()
          .setAuthor(`Action: Staff Approval`, client.user.displayAvatarURL())
          .setThumbnail(message.guild.iconURL({dynamic: true}))
          .setColor("BLUE")
          .setDescription(`<@${user.id}> Has been added to the Staff Team Successfully`)

          return message.channel.send(embed)

    }
   } catch (e) {

        var embed2 = new MessageEmbed()
            .setTitle('Whoops, Something went wrong!!!')
            .setColor('#7289DA')
            .setDescription("If this issue continues please contact our Dev Team")
            .addField("Error", `${e.message}`)
            .setTimestamp()

        return message.channel.send(embed2);
     }
}

module.exports.help = {
    name: "add-staff",
    category: "owner",
    aliases: [],
    description: "Add someone to Panel Access!",
    example: "``add-staff <@User>``"
}

module.exports.requirements = {
    userPerms: [],
    clientPerms: ['EMBED_LINKS','SEND_MESSAGES'],
    ownerOnly: false,
    higherOnly: true
}

module.exports.limits = {
    rateLimit: 2,
    cooldown: 1e4
}
