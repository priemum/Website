const BOTS = require("../models/bots")
const { MessageEmbed } = require("discord.js")
module.exports.run = async (client , message, args) => {
 
        message.delete().catch()
 
    try { 
 
    //check if more than 1 user is mentioned
    if(args.length > 1) return message.channel.send('Only mention one user!');
 
    //check if there is no arguments
    if(!args[0]) return message.channel.send('Mention someone or provide a valid User ID!');
 
    //check if there is 1 argument
    if(args[0]){
 
    let member = message.mentions.members.first();
 
    if (!member) member = client.users.cache.get(args[0]);
 
    let memberPerms = member.permissions.toArray();
 
    let finalPerms = [];
    let textPerms = [];
    let voicePerms = [];

 
    let perms = {
      "READ_MESSAGES": "Read Messages",
      "CREATE_INSTANT_INVITE": "Create Invites",
      "KICK_MEMBERS": "Kick Members",
      "BAN_MEMBERS": "Ban Members",
      "ADMINISTRATOR": "Admin User", 
      "MANAGE_CHANNELS": "Manage Channels",
      "MANAGE_GUILD": "Super Admin",
      "ADD_REACTIONS": "Add Reactions",
      "VIEW_AUDIT_LOG": "View Audit Logs",  
      "STREAM": "Stream",
      "VIEW_CHANNEL": "View Channel",
      "READ_MESSAGES": "Read Messages",
      "SEND_MESSAGES": "Send Messages", 
      "SEND_TTS_MESSAGES": "Send TTS Messages",
      "MANAGE_MESSAGES": "Manage Messages",
      "EMBED_LINKS": "Embed Links",
      "ATTACH_FILES": "Attach Files",
      "READ_MESSAGE_HISTORY": "Read Message History",
      "MENTION_EVERYONE": "Mention Everyone",
      "USE_EXTERNAL_EMOJIS": "Use External Emojis",
      "VIEW_GUILD_INSIGHTS": "View Guild Insights",
      "CONNECT": "Connect",
      "SPEAK": "Speak",
      "PRIORITY_SPEAKER": "Priority Speaker",
      "MUTE_MEMBERS": "Mute Members",
      "DEAFEN_MEMBERS": "Deafen Members",
      "MOVE_MEMBERS": "Move Members",
      "USE_VAD": "Voice Activity Detection",
      "CHANGE_NICKNAME": "Change Nickname",
      "MANAGE_NICKNAMES": "Manage Nicknames",
      "MANAGE_ROLES": "Manage Roles",
      "MANAGE_WEBHOOKS": "Manage Webhooks",
      "MANAGE_EMOJIS": "Manage Emojis"
}
 
    memberPerms.forEach(perm => { 
        finalPerms += `• ${perms[perm]}\n`
        textPerms += `• ${perms[perm. filter(p => p.category === 'text')]}\n`
        voicePerms += `• ${perms[perm. filter(p => p.category === 'voice')]}\n`
    });
 
     if (!member || member.bot) return message.channel.send(`Please provide a **user** to get info about.`);
        //if (user.id === message.client.user.id) return message.channel.send(`-_- No`);
 
     let userBots = await BOTS.find({ owner: member.user.id}, { _id: false })
 
      //if the member exists create an embed with info about that user and send it to the channel
      if(member) {
        let embed = new MessageEmbed()
          .setTitle(`${member.user.username}s Permissions`)
          .setThumbnail(member.user.displayAvatarURL())
          .addField('Text Channel Perms', textPerms, true)
          .addField('Voice Channel Perms', voicePerms, true)
          .setFooter(`Requested By: ${message.author.username}`);
 
        message.channel.send(embed);
      } else {
          message.channel.send(`Could not find that member`); //send a message to the channel if the user doesn't exist
      }
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
    name: "perms",
    category: "info",
    aliases: ['permissions'],
    description: "Shows what permissions the specified user has",
    example: "``perms <@user>``"
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
