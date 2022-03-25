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

const home = require("./home")

app.use("/", home) 

app.get('/', (req, res) => {
    if (!req.query.q) res.redirect('/');
});

module.exports = app;
