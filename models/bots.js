const mongoose = require("mongoose");

const newbots = mongoose.Schema({
    botid: { type: String, default: "00000" },
    username: { type: String, default: "justabot" },
    owner: { type: String, default: "00000" },
    prefix: { type: String, default: "No prefix" },
    short: { type: String, default: "No short description" },
    long: { type: String, default: "No long description" },
    invite: { type: String, default: "No invite description" },
    votes: { type: Number, default: 0 },
    avatar: { type: String, default: "https://maxcdn.icons8.com/Share/icon/Logos/discord_logo1600.png" },
    serverlink: { type: String, default: "https://discord.gg/Cqy99Pt" },
    website: { type: String, default: "https://paradisebots.net/" },
    github: { type: String, default: "https://github.com/" },
    tags:  { type: String, default: "None" },
    status: { type: String, default: "pending" },
    library: { type: String, default: "None" },
    date: { type: Number, default: 000 },
    servers: { type: Number, default: 0 },
    shards: { type: Number, default: 0 },
    auth: { type: String, default: "None" },
    donate: { type: String, default: "https://www.patreon.com/ParadiseBots" },
    certifiedBot: {type: String, default: "uncertified" },
    partneredBot: {type: String, default: "unpartnered" },
    voteBanned: {type: String, default: "unbanned" },
    additionalOwners: { type: Array },
    likes: { type: Map, of: String, default: {}},
    dislikes: { type: Map, of: String, default: {}},
    webhook: {type: String, default: "none" },
    pending_cert: {type: Boolean, default: false },
    is_certified: {type: Boolean, default: false },
    vanity: {type: String, default: "none" },
    banner: {type: String, default: "https://cdn.discordapp.com/attachments/825773503298404364/825901309982933014/ParadiseBanner.jpg"}
});

module.exports = mongoose.model("bots", newbots);
