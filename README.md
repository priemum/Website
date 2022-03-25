# Paradise Bot List
Source code for the Paradise Bot List Website

---

## Features
```css

- Upvoting for Bots
- Certification program for bots
- Vanity URL for Certified Bots
- Partner Program
- Server Count API
- GET API 
- Custom bot pages
- Webhook updates for bots 
- Markdown  and HTML Long Description
- Custom Bot Invite Link
- Custom Bot Website Link
- Has Search
- Mobile Support 
- Tags for bots
- Custom Bot Support Link
- Friendly and active staff

```

---

## Stack Info
- This Website/Code may be Outdated or use Deprecated Library's
- I will Update the code as often as possible but you are also welcome to commit changes and Open a PR

---

## Self Hosting
1. Download or Fork this Repo
2. Edit the Values in `config.js` (Examples Below)
3. Update Staff List on line `310` of `dashboard/dashboard.js`
4. Run `npm install` and wait for it to finish.
5. Run `npm start` both in Hosted and Locally to start the Website and Client.

---

## Config Setup
```js
exports.port=8080, // The PORT for your Webserver
exports.token="SomeSuperSecretTokenYes", // Your Discord Client Token
exports.domain="https://somesite.com", // Your website domain
exports.clientSecret="", // Your Discord Client Secret
exports.id=process.env.id || "123456789101112131417", // Your Discord Client ID
exports.owners=[ // Array of Bot List Owners
    "510065483693817867"
]
exports.higherStaff=[ // Array of Bot List Staff
    "510065483693817867"
]
exports.partneredUsers=[ // Array of Partnered Users
    "510065483693817867"
]
exports.partneredBots=[ // Array of Partnered Bots
    "510065483693817867"
]
exports.certifiedBots=[ // Array of Certified Bots
    "510065483693817867"
]
exports.votingBanned=[ // Array of Vote Banned Users
    "510065483693817867"
]
exports.botlogs="123456789101112131417" // Bot Logs Channel ID
exports.reportslog="123456789101112131417" // Report Logs Channel ID
exports.bot_reportslog="123456789101112131417" // Report Logs Channel ID
exports.votelogs="123456789101112131417" // Vote Logs Channel ID
exports.guildid="123456789101112131417" // Your Bot List Guild ID
exports.testingid="123456789101112131417" // Bot Testing Server ID
exports.modlog="123456789101112131417" // Approval/Denial Logs Channel ID
exports.certifiedLogs="123456789101112131417" // Certified Bots Log Channel ID
exports.staff="123456789101112131417" // Bot List Staff Role ID
exports.staffTrial="123456789101112131417" // Trial Staff Role ID
exports.web_admin="123456789101112131417" // Web Admin Role ID
exports.verifiedbots="123456789101112131417" // Verified Bots Role ID
exports.verifieddevs="123456789101112131417" // Verified Devs Role ID
exports.pendingbots="123456789101112131417" // Pending Bots Role ID
exports.certified_devs="123456789101112131417" // Certified Devs Role ID
exports.certified_bots="123456789101112131417" // Certified Bots Role ID
exports.maintenance="Disabled" // Website Maintenance Mode (Enabled or Disabled)

/** WEBSITE STUFF **/
exports.borderStats=process.env.borderStats || 'true' // Add Bordered Stats to the Stats Page
exports.apiVersion=process.env.apiVersion || 'v1.0.8' // The Current Bot List API Version
exports.botVersion=process.env.botVersion || 'v2.2.0' // The Current Discord Bot Version
exports.webVersion=process.env.webVersion || 'v2.4.0' // The Current Website Version
exports.djsVersion=process.env.djsVersion || 'v12.2.0' // Discord.js Version
exports.nodeVersion=process.env.nodeVersion || 'v12.16.3' // Node Version

exports.linkedStatus = '123456789101112131417' // Role users get for having your Domain in their status 
```
---

## Support
If you need support, Want to request a feature or anything of the sort please feel free to open a Issue or Pull Request.

