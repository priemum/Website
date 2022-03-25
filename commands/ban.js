const BOTS = require("../models/bots");
const { MessageEmbed } = require('discord.js');

module.exports.run = async (client, message, args, guild) => {

    message.delete().catch()

    if(!message.member.hasPermission('BAN_MEMBERS')) {

    let noPerms = new MessageEmbed()
      .setTitle("Error: Permissions")
      .setDescription(`**Missing Perms:** BAN_MEMBERS`)
      .setTimestamp()

      message.channel.send(noPerms);

    } else if(!args[0]){

      let noUser = new MessageEmbed()
      .setTitle("Error: Missing Args")
      .setDescription("Bruhh -_- I cant ban air, Who should i ban")
      .setTimestamp()

      message.channel.send(noUser);

    } else if(!args[1]){

      let noReason = new MessageEmbed()
      .setTitle("Error: Missing Args")
      .setDescription("What is the reason for the ban!!")
      .setTimestamp()

      message.channel.send(noReason);

    } else {

      try {
        const banned = await message.mentions.members.first(); //get the first member that was mentioned

       if (!banned) banned = await client.users.cache.get(args[0]);

        const banner = message.author.tag; //get the user that sent the command

        const reason = args.slice(1).join(' '); //get the second argument

        const channel = client.channels.cache.find(channel => channel.name === "mod-logs"); //attempt to find the channel called mod-logs

        if(banned){

          let cantBan = new MessageEmbed()
            .setTitle("Error: User not Bannable")
            .setDescription("I cant ban that user -_- Do they have higher perms?!!")
            .setTimestamp()

          if(!message.guild.member(banned).bannable) return message.channel.send(cantBan);

          if(message.guild.member(banned).hasPermission("BAN_MEMBERS")) return message.channel.send(cantBan);


          await banned.ban(); //ban the user

          const embed = new MessageEmbed()
            .setTitle(`Member banned by ${banner}`)
            .addField('Banned Member', `${banned}`, true)
            .addField('Server', `${message.guild.name}`, true)
            .setDescription(`**Reason:** ${reason}`)
            .setTimestamp()

          channel.send(embed);
          message.channel.send("User was banned")
        } else{
            message.channel.send("Member not found.");
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
  }

module.exports.help = {
    name: "ban",
    category: "Moderation",
    aliases: ['banem', 'yeet'],
    description: "Ban tyhe Provided User or Bot",
    example: "``ban <@mention>``"
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
