const BOTS = require("../models/bots")
const { MessageEmbed } = require("discord.js")
const fetch = require('node-fetch');
const snekfetch = require('snekfetch');
const moment = require ('moment');

module.exports.run = async (client , message, args) => {

       	try {
        const { body } = await snekfetch
            .get('https://www.reddit.com/r/dankmemes.json?sort=top&t=week')

        const noMemes = new MessageEmbed()
        noMemes.setColor('#7289DA')
        noMemes.setTitle('Unknown Error')
        noMemes.setDescription('Whoops, Looks like we are out of fresh memes. Try again in a few.')
    
        const allowed = message.channel.nsfw ? body.data.children : body.data.children.filter(post => !post.data.over_18);
        if (!allowed.length) return message.channel.send(noMemes);
        if (!allowed.length) return message.channel.send(noMemes);
        const randomnumber = Math.floor(Math.random() * allowed.length)
        
        const embed = new MessageEmbed()
        embed.setColor('#7289DA')
        embed.setTitle(allowed[randomnumber].data.title)
        embed.setDescription("Posted by: " + allowed[randomnumber].data.author)
        embed.setImage(allowed[randomnumber].data.url)
        embed.addField("Other info:", "Up votes: " + allowed[randomnumber].data.ups + " | Comments: " + allowed[randomnumber].data.num_comments)
        embed.setFooter("Memes provided by r/dankmemes")
        
        message.delete().catch()
        message.channel.send(embed)
   
    } catch (err) {
        return console.log(err);
    }
}

 
module.exports.help = {
    name: "meme",
    category: "Fun",
    aliases: ['dank', 'meme-time', 'dank-memes'],
    description: "Fetches a random Meme from the Dank Memes subreddit.",
    example: "``meme``"
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
