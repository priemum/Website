// We import modules.
const url = require("url");
const path = require("path");
const ishtml = require('is-html');
const isjs = require('is-string');
const showdown = require('showdown');
const converter = new showdown.Converter();
converter.setOption('tables', 'true');
const url2 = require('is-url');
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const Strategy = require("passport-discord").Strategy;
const config = require("../config.js")
const ejs = require("ejs");
const bodyParser = require("body-parser");
const { Client, MessageEmbed, Discord } = require("discord.js");
const ERRORS = require("../models/errors")
const BOTS = require("../models/bots")
const USERS = require("../models/users")
const VOTES = require("../models/votes")
const REPORTS = require("../models/report")
const ms = require("parse-ms");
const { WebhookClient } = require("discord.js");
const ratelimit = new Set()

//const { Canvas } = require("canvas-constructor");
const { createCanvas, loadImage } = require("canvas");
const fetch = require("node-fetch");
const cookieParser = require('cookie-parser')
const loopback = require('loopback');
const cheerio = require('cheerio');
const partner_app = require("../models/partner")
const staff_app = require("../models/staff")

// We instantiate express app and the session store.
const app = express();
const MemoryStore = require("memorystore")(session);

//const client = new Client();


const getList = require('../utils/getList.js')

app.get("/", async (req, res) => {
    const config = require("../config.js")

    const botlist = await BOTS.find({ status: "approved" }, { _id: false, auth: false }).sort([['votes', 'descending']])
    botlist.filter(bot => bot)

    const botlist2 = await BOTS.find({ status: "approved" }, { _id: false, auth: false }).sort([['date', 'descending']])
    botlist2.filter(bot => bot)

    const botlist3 = await BOTS.find({ certifiedBot: "certified" }, { _id: false, auth: false }).sort([['votes', 'descending']])
    botlist3.filter(bot => bot)

    for (i = 0; i < botlist.length; i++) {
      await req.app.get('client').users.cache.get(botlist[i].botid)
    }

    for (i = 0; i < botlist2.length; i++) {
      await req.app.get('client').users.cache.get(botlist2[i].botid)
    }

    for (i = 0; i < botlist3.length; i++) {
      await req.app.get('client').users.cache.get(botlist3[i].botid)
    }

    const certifiedBot = await BOTS.find({ botid: botlist.botid }, { certifiedBot: 'certified' }, { _id: false, auth: false })

    const partneredBot = await BOTS.find({ botid: botlist.botid }, { partneredBot: 'partnered' }, { _id: false, auth: false })

    let data = {
      isCertifiedBot: certifiedBot.certifiedBot === 'certified' ? true : false,
      isPartneredBot: partneredBot.partneredBot === 'partnered' ? true : false,
      bots3: botlist3,
      bots2: botlist2,
      bots: botlist,
      alert: null,
      error: null
    }

    renderTemplate(res, req, "index.ejs", data);
  });

  app.post("/", async (req, res) => {
    const config = require("../config.js")
    if (req.body.searchbutton) {
      return res.redirect("/search=" + req.body.search)
    }
  });

module.exports = app;
