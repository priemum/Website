const { MessageEmbed } = require("discord.js")
module.exports.run = async (client , message, args) => {

   message.delete().catch()

    const prefix = 'p>';

    var reportingBugs = [
        "1. Head over to our [Bug Reports](http://paradisebots.net/bug) page\n2.Fill out the form provided"
    ]

    var pingingStaff = [
        "Why are the Staff roles ``pingable`` and what is a ``ping``?\nA ``ping`` or a ``tag`` is where you mention a member (e.g. @Paradise) or role. This notifies that user or every user with that role.\n\nPinging one or two moderators for help is NOT a bad thing.\nPinging the entire staff team for no reason is wasting all of our time, and will result in a mute.\nThe role/s are pingable for emergencies only and not for you to get attention.\n\nEmergency Examples:\n\n- Raids / Multiple members mass spamming.\n\n- Anything that requires more than 2 Moderators to handle.\n\n- Extreme disruption of the Discord ToS. (NSFW content inside non-NSFW marked channels)"
    ]

    var staffApps = [
        "You don't. We have applications which we will open when we are in need of staff, you can apply then.\n• **DONT ASK**"
    ]

    var miniMod = [
        "``Mini-Modding`` or ``Backseat Moderating`` is when a member who is NOT a Moderator, takes up the role (of Moderator) by demanding other members or taking part in Moderator actions such as;\n\n- Requesting another member to move to the correct channels in a demanding manner.\n\n- Investigating issues that you cant help with (``Investigations`` are done by Staff, Admins or Moderators only).\n\n- Pestering a member to display their age to see if they are underage (although this isn't necessarily bad, some members have been found pestering members who dont wish to display their age).\n\nAlthough we follow the Discord Terms of Service, we are not out to witch hunt new members.\n\n- Attempting to handle situations in any of the channels when a Moderator is active or handling the situation themselves."
    ]

    var loginHelp = [
        "Having troubles logging in to your correct account or discord is defaulting to an alt?\nNo worries. When you get to the Authorize screen of your user card (Seen Below)  just click the ``Not You`` button and it will allow you to sign into a different account."
    ]


    var approvalHelp = [
        "We try to approve bots in the order which they were added.\nThat being said we strive for a 7 Day turnaround if not instant.\n You should also receive a DM from our official bot letting you know if your bot was approved or denied\n• Do not bug or harass the approvers or staff about approval, we are humans give us time."
    ]

    var deniedHelp = [
        "Your bot didn't follow our [bot rules](https://paradisebots.net/botrules)\nCheck the #website-logs channel for the reason why it was denied as well as by what moderator.\nAdditionally you can also find the Denial Reason and Moderator in the DM from Paradise Bot.\nIt is also possible that your bot was tested using permissions=0 to avoid this make sure your bot functions correctly with or without permissions (e.g: checking if user is admin instead of checking for bot permissions)"
    ]

    var deniedInfo = [
        "1. Bots that are Denied or Removed can be ReSubmitted.\n2. Bots who are Denied and Resubmitted within 24 Hours will not lose their place in queue."
    ]

    const embed = new MessageEmbed()
          .setTitle('Frequently Asked Questions')
          .setDescription('Below is a list of our Frequently Asked Questions shoved into one big command. If you need help follow the examples and usage guides.')
          .addField('\u200b', '\u200b')
          .addField('FAQs Usage', `${prefix}faqs <faqName>`)
          .addField('\u200b', '\u200b')
          .addField('Usage Example', `${prefix}faqs bugs`)
          .addField('\u200b', '\u200b')
          .addField('Available FAQs', '[bugs] - Displays our Bug Reports FAQ\n\n[staff-pings] - Displays our Staff Pings FAQ\n\n[staff-apps] - Displays our Staff Application FAQ\n\n[mini-mod] - Displays our Mini-Modding FAQ\n\n[login] - Displays our FAQs for Wrong Account Logins\n\n[approvals] - Displays our Approval FAQ\n\n[denied-bots] - Displays our Denied Bots FAQ\n\n[denied-info] - Displays our Denied Bots Info FAQ')
          .setTimestamp()
          .setFooter(`Requested By: ${message.author.username}`)


    if (!args[0]) return message.channel.send(embed);

    if (args[0] === 'bugs') {

        const bugEmbed = new MessageEmbed()
              bugEmbed.setTitle('FAQ 1: How do i report bugs?')
              bugEmbed.setDescription(reportingBugs)
              bugEmbed.setTimestamp()
              bugEmbed.setFooter(`Requested By: ${message.author.username}`)

        message.channel.send(bugEmbed);
    } else if (args[0] === 'staff-pings') {
        
        const pingEmbed = new MessageEmbed()
              pingEmbed.setTitle('FAQ 2: Why cant i ping staff?')
              pingEmbed.setDescription(pingingStaff)
              pingEmbed.setTimestamp()
              pingEmbed.setFooter(`Requested By: ${message.author.username}`)

        message.channel.send(pingEmbed);
    } else if (args[0] === 'staff-apps') {
        
        const appEmbed = new MessageEmbed()
              appEmbed.setTitle('FAQ 3: How do i apply for staff?')
              appEmbed.setDescription(staffApps)
              appEmbed.setTimestamp()
              appEmbed.setFooter(`Requested By: ${message.author.username}`)

        message.channel.send(appEmbed);
    } else if (args[0] === 'mini-mod') {
        
        const modEmbed = new MessageEmbed()
              modEmbed.setTitle('FAQ 4: What is Mini-Modding?')
              modEmbed.setDescription(miniMod)
              modEmbed.setTimestamp()
              modEmbed.setFooter(`Requested By: ${message.author.username}`)

        message.channel.send(modEmbed);
    } else if (args[0] === 'login') {
        
        const loginEmbed = new MessageEmbed()
        loginEmbed.setTitle('FAQ 5: Not logged in to the right account?')
        loginEmbed.setDescription(loginHelp)
        loginEmbed.setTimestamp()
        loginEmbed.setFooter(`Requested By: ${message.author.username}`)

        message.channel.send(loginEmbed);
    } else if (args[0] === 'approvals') {
        
        const approvalEmbed = new MessageEmbed()
        approvalEmbed.setTitle('FAQ 6: How long does approval take?')
        approvalEmbed.setDescription(approvalHelp)
        approvalEmbed.setTimestamp()
        approvalEmbed.setFooter(`Requested By: ${message.author.username}`)

        message.channel.send(approvalEmbed);
    } else if (args[0] === 'denied-bots') {
        
        const deniedEmbed = new MessageEmbed()
        deniedEmbed.setTitle('FAQ 7: Why was my bot denied?')
        deniedEmbed.setDescription(deniedHelp)
        deniedEmbed.setTimestamp()
        deniedEmbed.setFooter(`Requested By: ${message.author.username}`)

        message.channel.send(deniedEmbed);
    } else if (args[0] === 'denied-info') {
        
        const dinfoEmbed = new MessageEmbed()
        dinfoEmbed.setTitle('FAQ 8: Info for Denied Bots')
        dinfoEmbed.setDescription(deniedInfo)
        dinfoEmbed.setTimestamp()
        dinfoEmbed.setFooter(`Requested By: ${message.author.username}`)

        message.channel.send(dinfoEmbed);
    } else {
        let noValid = new MessageEmbed()
            noValid.setTitle('Whoops, Thats not right!!')
            noValid.setDescription('You didnt provide a valid option, Please choose one of the options provided.')
            noValid.setTimestamp()
            noValid.setFooter(`Requested By: ${message.author.username}`)
    }
}

    module.exports.help = {
        name: "faqs",
        category: "info",
        aliases: ['faq'],
        description: "Paradise Bots FAQs",
        example: "``faqs``"
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
