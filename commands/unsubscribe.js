const BOTS = require("../models/bots")
const { MessageEmbed } = require("discord.js")
const config = require("../config.js")

module.exports.run = async (client, message, args) => {

    message.delete().catch()
        
        let user = client.guilds.cache.get(config.guildid).members.cache.get(message.author.id);

        let updatePings = client.guilds.cache.get(config.guildid).roles.cache.get('748977820776267867');

        let giveawayPings = client.guilds.cache.get(config.guildid).roles.cache.get('781419158323593247');

         let appPings = client.guilds.cache.get(config.guildid).roles.cache.get('781419060721877013');
 
        let roleToSub = args.slice(0).join(' ');

        let subHelp = new MessageEmbed()
            subHelp.setTitle('Self Assignable Roles')
            subHelp.setColor('#7289DA')
            subHelp.setDescription('Are you sure? You will no longer be notified!')
            subHelp.addField('Server Updates', 'Name: updates\nDescription: Stop getting notified about Server, API and Website Updates\nUsage: `p>unsub updates', true)
            subHelp.addField('Giveaway Updates', 'Name: giveaways\nDescription: Stop getting notified about in Server events and giveaways\nUsage: `p>unsub giveaways', true)
            subHelp.addField('Application Updates', 'Name: applications\nDescription: Stop getting notified when we open Staff Applications\nUsage: p>unsub applications ', true)
            subHelp.setFooter('Usage: p>unsub <Name>')

        if (!roleToSub) return message.channel.send(subHelp);

        if (roleToSub === 'updates') {
            let successEmbed = new MessageEmbed()
                successEmbed.setTitle('UnSubscription Successful')
                successEmbed.setColor('#7289DA')
                successEmbed.setDescription('You have unsubscribed from Server, Website and API Updates.')
                successEmbed.setTimestamp()

             await user.roles.remove(updatePings)
        
            message.channel.send(successEmbed)
        
        } else if (roleToSub === 'giveaways') {

            let successEmbed = new MessageEmbed()
                successEmbed.setTitle('UnSubscription Successful')
                successEmbed.setColor('#7289DA')
                successEmbed.setDescription('You have unsubscribed from Giveaway Updates.')
                successEmbed.setTimestamp()

             await user.roles.remove(giveawayPings)
        
            message.channel.send(successEmbed)

        } else if (roleToSub === 'applications') { 

          let successEmbed = new MessageEmbed()
                successEmbed.setTitle('UnSubscription Successful')
                successEmbed.setColor('#7289DA')
                successEmbed.setDescription('You have unsubscribed from Updates regarding our Staff Applications')
                successEmbed.setTimestamp()

             await user.roles.remove(appPings)
        
            message.channel.send(successEmbed)
           
        } else {
            
        let noValid = new MessageEmbed()
            noValid.setTitle('Whoops, Thats not right!!')
            noValid.setDescription('You didnt provide a valid option, Please choose one of the options provided.')
            noValid.setTimestamp()
            noValid.setFooter(`Requested By: ${message.author.username}`)

         return message.channel.send(noValid)
     }     
}

    module.exports.help = {
        name: "unsubscribe",
        category: "Info",
        aliases: ['unsub',],
        description: "Self assignable roles, provide no params for help.",
        example: "``subscribe``"
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
