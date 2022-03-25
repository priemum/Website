const BOTS = require("../models/bots")
const { MessageEmbed } = require("discord.js")
module.exports.run = async (client , message, args) => {

        message.delete().catch()

        function checkDays(date) {
          let now = new Date();
          let diff = now.getTime() - date.getTime();
          let days = Math.floor(diff / 86400000);
          return days + (days == 1 ? " day" : " days") + " ago";
      };

    let verifLevels = ["None", "Low", "Medium", "(╯°□°）╯︵  ┻━┻", "┻━┻ミヽ(ಠ益ಠ)ノ彡┻━┻"];

    let region = {
        "brazil": ":flag_br: Brazil",
        "eu-central": ":flag_eu: Central Europe",
        "singapore": ":flag_sg: Singapore",
        "us-central": ":flag_us: U.S. Central",
        "sydney": ":flag_au: Sydney",
        "us-east": ":flag_us: U.S. East",
        "us-south": ":flag_us: U.S. South",
        "us-west": ":flag_us: U.S. West",
        "eu-west": ":flag_eu: Western Europe",
        "vip-us-east": ":flag_us: VIP U.S. East",
        "london": ":flag_gb: London",
        "amsterdam": ":flag_nl: Amsterdam",
        "hongkong": ":flag_hk: Hong Kong",
        "russia": ":flag_ru: Russia",
        "southafrica": ":flag_za:  South Africa"
    };

    const embed = new MessageEmbed()
        .setTitle(message.guild.name + " Info", "https://images-ext-1.discordapp.net/external/sZ9pfzfWEQE-GLx5O1dR15GbVPZCwVdVLcgKsuWm0x4/https/cdn.discordapp.com/icons/748977820457238530/2d720226a92f40ba5c17b8775b4e892d.webp?format=png")
        .addField("ID", message.guild.id, true)
        .addField("Owner", `${message.guild.owner.user.username}#${message.guild.owner.user.discriminator}`, true)
        .addField("Region", region[message.guild.region], true)
        .addField("Verification Level", `${verifLevels[message.guild.verificationLevel]}`, true)
        .addField("Channels", message.guild.channels.cache.size, true)
        .addField("Roles", message.guild.roles.cache.size, true)
        .addField("Member Count", `**Total:** ${message.guild.members.cache.size}\n**Humans:** ${message.guild.members.cache.filter(member => !member.user.bot).size}\n**Bots:** ${message.guild.members.cache.filter(member => member.user.bot).size}`)
        .addField("Creation Date", `${message.channel.guild.createdAt.toUTCString().substr(0, 16)} (${checkDays(message.channel.guild.createdAt)})`, true)
        .setThumbnail("https://images-ext-1.discordapp.net/external/sZ9pfzfWEQE-GLx5O1dR15GbVPZCwVdVLcgKsuWm0x4/https/cdn.discordapp.com/icons/748977820457238530/2d720226a92f40ba5c17b8775b4e892d.webp?format=png")
    message.channel.send({embed});
}


module.exports.help = {
    name: "serverinfo",
    category: "info",
    aliases: ['si'],
    description: "Shows some info about the server",
    example: "``serverinfo``"
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
