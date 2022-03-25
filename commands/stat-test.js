const BOTS = require("../models/bots");
 const { MessageEmbed } = require('discord.js');

 const PBL = require("paradiseapi.js")
 const stats = new PBL();

 module.exports.run = async (client, message, args) => {

   
     message.delete().catch()

  try {

     stats.get(client.user.id, function(data){ // ID should be string

     let ownerName = client.users.cache.get(data.owner) ? client.users.cache.get(data.owner).username : data.owner

      let user = '';

       let usersArray = [data.usersVoted]
      
      //let theUser = [];

      usersArray.map(voted => {

          console.log(voted)

          user += `• ${voted}\n`
       })
            
       let embed = new MessageEmbed()
         .setTitle(`${data.username} Bot Info`)
         .setDescription('Imformation seen here is fetched using the Paradise Bots API')
         .addField('Bot ID', data.botid, true)
         .addField('Certified', data.certified, true)
         .addField('Vanity URL', `https://paradisebots.net/bots/${data.vanityURL}`, true)
         .addField('Bot Owner', ownerName, true) 
         .addField('Additional Owners', "None", true)
         .addField('Bot Prefix', data.prefix, true)
         .addField('Vote Count', ` ${data.votes} Votes`, true)
         .addField('Users who have Voted', user, true)
         .addField('Individual Users who have Voted', `${data.totalUsersVoted} Users`, true)
         .addField('Bot Library', data.library, true)
         .addField('Server Count', data.servers, true)
         .addField('Shard Count', data.shards, true)
         .addField('Likes 👍', data.likes, true)
         .addField('Dislikes 👎', data.dislikes, true)
         .setFooter(`Bot created by ${ownerName}`)

         message.channel.send(embed)
         })
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
     name: "stat-test",
     category: "Info",
     aliases: [],
     description: "IDEK",
     example: "``stat-test``"
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
