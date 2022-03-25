// We import modules.
const url = require('url');
const path = require('path');
const ishtml = require('is-html');
const isjs = require('is-string');
const showdown = require('showdown');
const converter = new showdown.Converter();
converter.setOption('tables', 'true');
converter.setOption('tables', 'true');
const url2 = require('is-url');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const Strategy = require('passport-discord').Strategy;
const config = require('../config.js');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const { MessageEmbed, Discord } = require('discord.js');
const ERRORS = require('../models/errors');
const BOTS = require('../models/bots');
const USERS = require('../models/users');
const VOTES = require('../models/votes');
const REPORTS = require('../models/report');
const ms = require('parse-ms');
const { WebhookClient } = require('discord.js');
const ratelimit = new Set();

const { is_staff, status } = require('../functions/staff');

const { registerFont } = require('canvas');
const { Canvas, resolveImage } = require('canvas-constructor');
const fetch = require('node-fetch');
const cookieParser = require('cookie-parser');
const loopback = require('loopback');
const cheerio = require('cheerio');
const partner_app = require('../models/partner');
const staff_app = require('../models/staff');

// We instantiate express app and the session store.
const app = express();
const MemoryStore = require('memorystore')(session);

const getList = require('../utils/getList.js');

// We export the dashboard as a function which we call in ready event.
module.exports = async (client) => {
  app.set('client', client);

  BOTS.find({}, async (err, bots) => {
    for (i = 0; i < bots.length; i++) {
      await client.users.fetch(bots[i].botid).then(async (bot) => {
        if (bot.username !== bots[i].username) {
          bots[i].username = bot.username;
          await bots[i].save();
        }
      });
    }
  });
  function formatNumbers(n) {
    if (n < 1e3) return n;
    if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + 'K';
    if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + 'M';
    if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + 'B';
    if (n >= 1e12) return +(n / 1e12).toFixed(1) + 'T';
  }
  function is_url(str) {
    let regexp =
      /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
    if (regexp.test(str)) {
      return true;
    } else {
      return false;
    }
  }
  // We declare absolute paths.
  app.use('/static', express.static(path.join(__dirname, 'public'))); // Css & Scripts directory
  app.use('/images', express.static(path.join(__dirname, 'images'))); // Image Storage CDN
  const dataDir = path.resolve(`${process.cwd()}${path.sep}dashboard`); // The absolute path of current this directory.
  const templateDir = path.resolve(`${dataDir}${path.sep}templates`); // Absolute path of ./templates directory.

  // Deserializing and serializing users without any additional logic.
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));

  // We set the passport to use a new discord strategy, we pass in client id, secret, callback url and the scopes.
  /** Scopes:
   *  - Identify: Avatar's url, username and discriminator.
   *  - Guilds: A list of partial guilds.
   */
  passport.use(
    new Strategy(
      {
        clientID: config.id,
        clientSecret: config.clientSecret,
        callbackURL: `${config.domain}/callback`,
        scope: ['identify'],
      },
      (accessToken, refreshToken, profile, done) => {
        // eslint-disable-line no-unused-vars
        // On login we pass in profile with no logic.
        process.nextTick(() => done(null, profile));
      },
    ),
  );

  // We initialize the memorystore middleware with our express app.
  app.use(
    session({
      cookie: { maxAge: require('ms')('10 years') },
      store: new MemoryStore({ checkPeriod: 86400000 }),
      secret:
        '#@%#&^$^$%@$^$&%#$%@#$%$^%&$%^#$%@#$%#E%#%@$FEErfgr3g#%GT%536c53cc6%5%tv%4y4hrgrggrgrgf4n',
      resave: false,
      saveUninitialized: false,
    }),
  );

  // We initialize passport middleware.
  const cookieParser = require('cookie-parser');
  app.use(cookieParser());

  // set a cookie
  app.use(function (req, res, next) {
    // check if client sent cookie
    var cookie = req.cookies.accessToken;
    if (cookie === undefined) {
      // no: set a new cookie
      var randomNumber = Math.random().toString();
      randomNumber = randomNumber.substring(2, randomNumber.length);
      res.cookie('User Auth', randomNumber, { maxAge: 900000, httpOnly: true });
      console.log('cookie created successfully');
    } else {
      // yes, cookie was already present
      console.log('cookie exists', cookie);
    }
    next(); // <-- important!
  });
  app.use(passport.initialize());
  app.use(passport.session());

  // We bind the domain.
  app.locals.domain = config.domain.split('//')[1];

  // We set out templating engine.
  app.engine('html', ejs.renderFile);
  app.set('view engine', 'html');

  function loadRoutes() {
    const routesPath = path.join(__dirname, '../routes');
    const routes = getFilesSync(routesPath);

    if (!routes.length) return this;

    routes.forEach((filename) => {
      const route = require(path.join(routesPath, filename));

      const routePath =
        filename === 'index.js' ? '/' : `/${filename.slice(0, -3)}`;

      try {
        app.use(routePath, route);
      } catch (error) {
        console.error(`Error occured with the route "${filename}"\n\n${error}`);
      }
    });

    return client;
  }

  // We initialize body-parser middleware to be able to read forms.
  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  );
  // We declare a renderTemplate function to make rendering of a template in a route as easy as possible.
  const renderTemplate = (res, req, template, data = {}) => {
    // Default base data which passed to the ejs template by default.
    const baseData = {
      bot: client,
      path: req.path,
      //path: loadRoutes(),
      user: req.isAuthenticated() ? req.user : null,
      theme: req.cookies.theme,
    };
    // We render template using the absolute path of the template and the merged default data with the additional data provided.
    res.render(
      path.resolve(`${templateDir}${path.sep}${template}`),
      Object.assign(baseData, data),
    );
  };
  // We declare a checkAuth function middleware to check if an user is logged in or not, and if not redirect him.
  const checkAuth = (req, res, next) => {
    // If authenticated we forward the request further in the route.
    if (req.isAuthenticated()) return next();
    // If not authenticated, we set the url the user is redirected to into the memory.
    req.session.backURL = req.url;
    // We redirect user to login endpoint/route.
    res.redirect('/login');
  };

  // Login endpoint.
  app.get(
    '/login',
    (req, res, next) => {
      // We determine the returning url.
      if (req.session.backURL) {
        req.session.backURL = req.session.backURL; // eslint-disable-line no-self-assign
      } else if (req.headers.referer) {
        const parsed = url.parse(req.headers.referer);
        if (parsed.hostname === app.locals.domain) {
          req.session.backURL = parsed.path;
        }
      } else {
        req.session.backURL = 'req.url';
      }
      // Forward the request to the passport middleware.
      next();
    },
    passport.authenticate('discord'),
  );

  // Callback endpoint.
  app.get(
    '/callback',
    passport.authenticate('discord', { failureRedirect: '/' }),
    /* We authenticate the user, if user canceled we redirect him to index. */ (
      req,
      res,
    ) => {
      // If user had set a returning url, we redirect him there, otherwise we redirect him to index.
      if (req.session.backURL) {
        const url = req.session.backURL;
        req.session.backURL = null;
        res.redirect(url);
      } else {
        res.redirect('/');
      }
    },
  );

  // Logout endpoint.
  app.get('/logout', function (req, res) {
    // We destroy the session.
    req.session.destroy(() => {
      // We logout the user.
      req.logout();
      // We redirect user to index.
      res.redirect('/');
    });
  });

  const sitemap = require('express-sitemap')();

  sitemap.XMLtoFile('sitemap.xml');
  sitemap.TXTtoFile('robots.txt');

  app.get('/sitemap.xml', function (req, res) {
    res.sendFile(path.join(__dirname, './templates', 'sitemap.xml'));
  });

  app.get('/robots.txt', function (req, res) {
    // send TXT map
    sitemap.generate4(app, ['/robots.txt']);
    //sitemap.generate()
    sitemap.TXTtoWeb(res);
  });

  app.get('/maintenance', async (req, res, next) => {
    renderTemplate(res, req, 'system/maintenance.ejs');
  });

  app.get('/500', async (req, res, next) => {
    renderTemplate(res, req, 'errors/500.ejs');
  });

  app.get('/twitter', async (req, res, next) => {
    renderTemplate(res, req, 'social/twitter.ejs');
  });

  app.get('/trello', async (req, res, next) => {
    renderTemplate(res, req, 'trello.ejs');
  });

  app.get('/github', async (req, res, next) => {
    res.redirect('https://github.com/ParadiseBotList');
  });

  // Certified Perks Docs
  app.get('/docs/certified/users', checkAuth, async (req, res, next) => {
    let certUser = USERS.findOne({ userID: req.user.id });

    if (!certUser.certifiedUser) return res.redirect('/');

    renderTemplate(res, req, 'certified-perks/certified-perks-docs.ejs');
  });

  // Docs endpoint.
  app.get('/api/v1/docs', async (req, res, next) => {
    renderTemplate(res, req, 'API/docs.ejs');
  });

  // Staff endpoint
  app.get('/staff', async (req, res, next) => {
    /**
     * OWNERS
     */
    const toxic = client.users.cache.get('510065483693817867');
    const sun = client.users.cache.get('365972246168207361');

    /**
     * Developer(s)
     */
    const pixel = client.users.cache.get('216852520088109056');

    /**
     * HEAD ADMIN(S)
     */
    const cpt = client.users.cache.get('391376464064282627');
    const connor = client.users.cache.get('324646179134636043');

    /**
     * WEB ADMIN(S)
     */
    const greed = client.users.cache.get('673937399801184306');

    /**
     * ADMIN USERS
     */
    const sebboy = client.users.cache.get('603543838681989141');
    const itzVoid = client.users.cache.get('250486950828441602');
    const awish = client.users.cache.get('671355502399193128');
    const windows = client.users.cache.get('222042705285480448');
    const bowman = client.users.cache.get('761860579307552788');
    const lags = client.users.cache.get('642308656217456641');

    /**
     * MODERATOR(S)
     */
    const dillon = client.users.cache.get('534232491360387082');
    const malluvs = client.users.cache.get('700397009336533032');
    const lokesh = client.users.cache.get('621009235915964417');

    /**
     * APPROVER(S)
     */
    const yuu = client.users.cache.get('635319965335158796');
    const harvey = client.users.cache.get('700382333496459295');
    const harley = client.users.cache.get('251736315001831425');
    const mitask = client.users.cache.get('686906244950261780');

    let data = {
      toxic: toxic,
      sun: sun,
      cpt: cpt,
      connor: connor,
      sebboy: sebboy,
      itzVoid: itzVoid,
      awish: awish,
      pixel: pixel,
      greed: greed,
      windows: windows,
      bowman: bowman,
      lags: lags,
      dillon: dillon,
      malluvs: malluvs,
      lokesh: lokesh,
      yuu: yuu,
      harvey: harvey,
      harley: harley,
      mitask: mitask,
    };

    renderTemplate(res, req, 'community/staff.ejs', data);
  });

  // Join endpoint
  app.get('/join', async (req, res, next) => {
    renderTemplate(res, req, 'community/join.ejs');
  });

  // Same as join Different Endpoint
  app.get('/discord', async (req, res, next) => {
    renderTemplate(res, req, 'community/join.ejs');
  });

  // Terms endpoint
  app.get('/legal', async (req, res, next) => {
    renderTemplate(res, req, 'legal/legal.ejs');
  });

  // Server Rules endpoint
  app.get('/serverrules', async (req, res, next) => {
    renderTemplate(res, req, 'community/serverrules.ejs');
  });

  // Bot Rules endpoint
  app.get('/botrules', async (req, res, next) => {
    renderTemplate(res, req, 'community/botrules.ejs');
  });

  // Partners endpoint
  app.get('/partners', async (req, res, next) => {
    renderTemplate(res, req, 'programs/partners.ejs');
  });

  // Sitemap endpoint
  app.get('/sitemap', async (req, res, next) => {
    renderTemplate(res, req, 'system/sitemap.ejs');
  });

  // Reports endpoint
  app.get('/reports', async (req, res, next) => {
    renderTemplate(res, req, 'reports/mainPage.ejs');
  });

  // Google HTML endpoint
  app.get('/google', async (req, res, next) => {
    renderTemplate(res, req, 'google495e91ca892cab69.html');
  });

  // Public User Profiles endpoint.
  /*app.get("/user/:userID", async (req, res) => {
     let user = req.app.get()
  })*/

  // Apps endpoint
  app.get('/apps', async (req, res, next) => {
    renderTemplate(res, req, 'applications/apps.ejs');
  });

  // staff apps
  app.get('/apps/staff', checkAuth, async (req, res, next) => {
    renderTemplate(res, req, 'applications/staff-app.ejs', {
      alert: null,
      error: null,
    });
  });

  app.post('/apps/staff', checkAuth, async (req, res, next) => {
    let check = await staff_app.findOne({ userID: req.user.id });
    if (check) {
      renderTemplate(res, req, 'applications/staff-app.ejs', {
        alert: null,
        error: 'You are already submitted!',
      });
    } else {
      if (req.body.submit) {
        await new staff_app({
          username: req.user.username,
          userID: req.user.id,
          experience: req.body.experience,
          position: req.body.position,
          reason: req.body.reason,
          strength: req.body.strength,
          handle: req.body.handle,
          rules: req.body.rules,
          trial: req.body.trial,
          development: req.body.development,
          kinda: req.body.kinda,
          tos: req.body.tos,
        }).save();
        let r = client.guilds.cache
          .get(config.guildid)
          .roles.cache.find((r) => r.id === '748977820776267871');
        await r.setMentionable(true);
        await client.guilds.cache
          .get(config.guildid)
          .channels.cache.get('762752189402972190')
          .send(
            `Hey ${r} | <@${req.user.id}> (\`${req.user.username}\`) submitted for staff app!`,
          );
        renderTemplate(res, req, 'applications/staff-app.ejs', {
          alert: 'Your staff  app has been sent to our staff team!',
          error: null,
        });
      }
    }
  });

  // partner apps
  app.get('/apps/partner', checkAuth, async (req, res, next) => {
    renderTemplate(res, req, 'applications/partner-app.ejs', {
      alert: null,
      error: null,
    });
  });

  app.post('/apps/partner', checkAuth, async (req, res, next) => {
    let check = await partner_app.findOne({ userID: req.user.id });
    if (check) {
      renderTemplate(res, req, 'applications/partner-app.ejs', {
        alert: null,
        error: 'You are already submitted!',
      });
    } else {
      if (req.body.submit) {
        await new partner_app({
          username: req.user.username,
          userID: req.user.id,
          what_youre_partnering: req.body.what_youre_partnering,
          reason_for_partner: req.body.reason_for_partner,
          invite: req.body.invite,
          what_you_offer: req.body.what_you_offer,
          members: req.body.members,
          agreement: req.body.agreement,
        }).save();
        let r = client.guilds.cache
          .get(config.guildid)
          .roles.cache.find((r) => r.id === '748977820776267871');
        await r.setMentionable(true);
        await client.guilds.cache
          .get(config.guildid)
          .channels.cache.get('762752187692351538')
          .send(
            `Hey ${r} | <@${req.user.id}> (\`${req.user.username}\`) submitted for partner program!`,
          );
        renderTemplate(res, req, 'applications/partner-app.ejs', {
          alert: 'Your partner app has been sent to our staff team!',
          error: null,
        });
      }
    }
  });

  /**
   * API ROUTING
   */

  app.get('/api/v1/bots/list', async (req, res, next) => {
    res.json(await getList());
  });

  app.post('/api/v1/bots/list', async (req, res, next) => {
    res.json(await getList());
  });

  app.get('/api/v1/users/:userID', async (req, res) => {
    const users = await USERS.findOne({ userID: req.params.userID });

    let the_user = client.users.cache.get(users.userID);

    if (!users)
      return res
        .status(404)
        .send(JSON.stringify({ ParadiseAPI: 'User not found!' }));

    let data = {
      userName: the_user.username,
      userID: users.userID,
      bio: users.bio,
      voteBanned: users.voteBanned,
      certifiedUser: users.certifiedUser,
    };
    res.status(200).send(JSON.stringify(data));
  });

  app.get('/api/v1/bots/:botid', async (req, res) => {
    const bots = await BOTS.findOne({ botid: req.params.botid });

    const botsVotedUsers = await VOTES.find({
      clientid: req.params.botid,
    }).limit(10);

    if (!bots)
      return res
        .status(404)
        .send(JSON.stringify({ ParadiseAPI: 'Bot not found!' }));

    if (bots.status === 'pending')
      return res
        .status(403)
        .send(JSON.stringify({ ParadiseAPI: 'Bot is not approved.' }));

    let users = '';

    let votedUsers = botsVotedUsers.map((voted) => {
      users += `<@!${voted.user}>, `;
    });

    let data = {
      username: bots.username,
      botid: bots.botid,
      certified: bots.is_certified,
      vanityURL:
        bots.vanity === 'none' || !bots.is_certified ? 'None' : bots.vanity,
      owner: bots.owner,
      additionalOwners: !bots.additionalOwners ? 'None' : bots.additionalOwners,
      prefix: bots.prefix,
      shortDescription: bots.short,
      longDescription: bots.long,
      votes: bots.votes === 0 ? 'No votes Recorded' : bots.votes,
      usersVoted: users,
      totalUsersVoted: votedUsers.length || 'No total Value',
      server:
        bots.serverlink === 'https://discord.gg/Cqy99Pt'
          ? 'None'
          : bots.serverlink,
      website:
        bots.website === 'https://paradisebots.net/' ? 'None' : bots.website,
      github:
        bots.github.includes('IE:') || bots.github === 'https://github.com/'
          ? 'None'
          : bots.github,
      donate:
        bots.donate === 'https://www.patreon.com/ParadiseBots' ||
        bots.donate === 'https://paypal.me/'
          ? 'None'
          : bots.donate,
      tags: bots.tags || 'None',
      library: bots.library || 'None',
      servers: bots.servers === 0 ? 'Not Available' : bots.servers,
      shards: bots.shards === 0 ? 'Not Available' : bots.shards,
      likes: bots.likes.size === 0 ? 'Bot has No Likes' : bots.likes.size,
      dislikes:
        bots.dislikes.size === 0 ? 'Bot has No Dislikes' : bots.dislikes.size,
    };
    res.status(200).send(JSON.stringify(data));
  });

  app.get('/stats', async (req, res, next) => {
    const bots = await BOTS.find({ status: 'approved' });

    const bots2 = await BOTS.find({ status: 'pending' });

    const approvedTotal = bots.length;

    const pendingTotal = bots2.length;

    let paradiseUptime;

    let currentdate = new Date().toLocaleDateString();

    var milliseconds = parseInt((client.uptime % 1000) / 100),
      seconds = parseInt((client.uptime / 1000) % 60),
      minutes = parseInt((client.uptime / (1000 * 60)) % 60),
      hours = parseInt((client.uptime / (1000 * 60 * 60)) % 24);

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    paradiseUptime = `${hours} Hours, ${minutes} Minutes, ${seconds} Seconds`;

    const paradisePing = client.ws.ping;

    let data = {
      lastUpdated: currentdate,
      ApprovedBots: approvedTotal,
      botsInQueue: pendingTotal,
      uptime: paradiseUptime,
      ping: paradisePing,
      memory: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
    };
    renderTemplate(res, req, 'system/stats.ejs', data);
  });

  app.post('/api/v1/bot/:botid', async (req, res, next) => {
    let auth = req.headers.authorization;
    if (!auth)
      return res.status(403).send(
        JSON.stringify({
          ParadiseAPI:
            "Authorization header not found, Go generate a auth token for your bot or make sure it's valid!",
          error: true,
          status: '403',
        }),
      );
    let servers = req.body.server_count;
    if (!servers)
      return res.status(404).send(
        JSON.stringify({
          ParadiseAPI: "Can't find server_count.",
          error: true,
          status: '404',
        }),
      );
    servers = parseInt(servers);
    if (!servers)
      return res.status(400).send(
        JSON.stringify({
          ParadiseAPI: 'server_count not integer.',
          error: true,
          status: '400',
        }),
      );
    BOTS.findOne({ botid: req.params.botid }, (err, bot2) => {
      if (!bot2)
        return res.status(404).send(
          JSON.stringify({
            ParadiseAPI: 'Bot not found!',
            error: true,
            status: '404',
          }),
        );
      if (!bot2.auth)
        return res.status(403).send(
          JSON.stringify({
            ParadiseAPI:
              "Authorization header not found, Go generate a auth token for your bot or make sure it's valid!",
            error: true,
            status: '403',
          }),
        );
      if (bot2.auth !== auth) {
        return res.status(400).send(
          JSON.stringify({
            ParadiseAPI: 'Incorrect authorization token.',
            error: true,
            status: '404',
          }),
        );
      } else {
        BOTS.findOne({ botid: req.params.botid }, async (err, bot) => {
          if (!bot)
            return res.status(404).send(
              JSON.stringify({
                ParadiseAPI: 'Bot not found.',
                error: true,
                status: '404',
              }),
            );
          if (bot.status === 'pending')
            return res.status(403).send(
              JSON.stringify({
                ParadiseAPI: 'Bot is not approved.',
                error: true,
                status: '403',
              }),
            );
          bot.servers = servers;
          if (req.body.shard_count) {
            if (!parseInt(req.body.shard_count))
              return res.status(400).send(
                JSON.stringify({
                  ParadiseAPI: 'shard_count not integer.',
                  error: true,
                  status: '400',
                }),
              );
            bot.shards = req.body.shard_count;
          } else {
            bot.shards = 0;
          }
          if (ratelimit.has(req.params.botid + 'stats'))
            return res.status(429).send(
              JSON.stringify({
                ParadiseAPI:
                  'Your are being ratelimited, 1 request per 5 mins.',
                error: true,
                status: '429',
              }),
            );
          await bot.save();
          await ratelimit.add(req.params.botid + 'stats');
          setTimeout(async () => {
            await ratelimit.delete(req.params.botid + 'stats');
          }, 300000);
          await res.status(200).send(
            JSON.stringify({
              ParadiseAPI: ' Your Stats Have Been Posted.',
              error: false,
              status: '200',
            }),
          );
        });
      }
    });
  });
  app.get('/', async (req, res, next) => {
    const config = require('../config.js');

    const botlist = await BOTS.find(
      { status: 'approved' },
      { _id: false, auth: false },
    ).sort([['votes', 'descending']]);
    botlist.filter((bot) => bot);

    const botlist2 = await BOTS.find(
      { status: 'approved' },
      { _id: false, auth: false },
    ).sort([['date', 'descending']]);
    botlist2.filter((bot) => bot);

    const botlist3 = await BOTS.find(
      { certifiedBot: 'certified' },
      { _id: false, auth: false },
    ).sort([['votes', 'descending']]);
    botlist3.filter((bot) => bot);

    for (i = 0; i < botlist.length; i++) {
      await client.users.fetch(botlist[i].botid);
    }

    for (i = 0; i < botlist2.length; i++) {
      await client.users.fetch(botlist2[i].botid);
    }

    for (i = 0; i < botlist3.length; i++) {
      await client.users.fetch(botlist3[i].botid);
    }

    const certifiedBot = await BOTS.find(
      { botid: botlist.botid },
      { certifiedBot: 'certified' },
      { _id: false, auth: false },
    );

    const partneredBot = await BOTS.find(
      { botid: botlist.botid },
      { partneredBot: 'partnered' },
      { _id: false, auth: false },
    );

    let data = {
      isCertifiedBot: certifiedBot.certifiedBot === 'certified' ? true : false,
      isPartneredBot: partneredBot.partneredBot === 'partnered' ? true : false,
      bots3: botlist3,
      bots2: botlist2,
      bots: botlist,
      alert: null,
      error: null,
    };

    renderTemplate(res, req, 'index.ejs', data);
  });

  app.post('/', async (req, res, next) => {
    const config = require('../config.js');
    if (req.body.searchbutton) {
      return res.redirect('/search=' + req.body.search);
    }
  });
  app.get('/search=:value', async (req, res, next) => {
    await BOTS.find({}, async (err, bots) => {
      for (i = 0; i < bots.length; i++) {
        await client.users.fetch(bots[i].botid).then(async (bot) => {
          if (bot.username !== bots[i].username) {
            bots[i].username = bot.username;
            await bots[i].save();
          }
        });
      }
    });
    const certifiedBot = await BOTS.find({ certifiedBot: 'certified' });
    const partneredBot = await BOTS.find({ partneredBot: 'partnered' });
    let bots = await BOTS.find({ status: 'approved' }).sort([
      [req.params.value, 'descending'],
    ]);
    for (i = 0; i < bots.length; i++) {
      await client.users.fetch(bots[i].botid);
    }
    bots = bots.filter((bot) => {
      if (bot.username.toLowerCase().includes(req.params.value)) return true;
      else if (bot.username.toUpperCase().includes(req.params.value))
        return true;
      else if (bot.username.includes(req.params.value)) return true;
      else if (bot.tags.toLowerCase().includes(req.params.value)) return true;
      else if (bot.tags.toUpperCase().includes(req.params.value)) return true;
      else if (bot.tags.includes(req.params.value)) return true;
      else return false;
    });
    renderTemplate(res, req, 'bots/search.ejs', {
      isCertifiedBot: bots.certifiedBot === 'certified' ? true : false,
      bots: bots,
      alert: null,
      error: null,
    });
  });
  app.get('/error', async (req, res, next) => {
    renderTemplate(res, req, 'errors/error.ejs', { alert: null, error: null });
  });
  app.get('/add', checkAuth, async (req, res, next) => {
    renderTemplate(res, req, 'bots/add.ejs', { alert: null, error: null });
  });
  app.get('/panel', checkAuth, async (req, res, next) => {
    let webAdmin = req.user.id;

    if (!config.owners.includes(req.user.id)) {
      return res.redirect('/');
    } else {
      /*if(!is_staff(req.user.id)) {

      return res.redirect("/error");

    } else {*/
      const penbotlist = await BOTS.find(
        { status: 'pending' },
        { _id: false, auth: false },
      ).sort([['descending']]);
      penbotlist.filter((bot) => bot);
      for (i = 0; i < penbotlist.length; i++) {
        await client.users.fetch(penbotlist[i].botid);
      }
      const bugres = await ERRORS.find({}, { _id: false, auth: false });
      bugres.filter((bug) => bug);
      const partners = await partner_app.find({}, { _id: false, auth: false });
      partners.filter((app) => app);
      for (i = 0; i < partners.length; i++) {
        await client.users.fetch(partners[i].userID);
      }
      const staff_apps = await staff_app.find({}, { _id: false, auth: false });
      staff_apps.filter((app) => app);
      for (i = 0; i < staff_apps.length; i++) {
        await client.users.fetch(staff_apps[i].userID);
      }
      renderTemplate(res, req, 'panel.ejs', {
        webAdmin: webAdmin,
        bots: penbotlist,
        alert: null,
        error: null,
        reportbug: bugres,
        partners: partners,
        staff_apps: staff_apps,
      });
    }
  });
  app.post('/panel', checkAuth, async (req, res, next) => {
    const webAdmin = req.user.id;

    let partners = await partner_app.find({}, { _id: false, auth: false });
    partners.filter((app) => app);
    for (i = 0; i < partners.length; i++) {
      await client.users.fetch(partners[i].userID);
    }
    let staff_apps = await staff_app.find({}, { _id: false, auth: false });
    staff_apps.filter((app) => app);
    for (i = 0; i < staff_apps.length; i++) {
      await client.users.fetch(staff_apps[i].userID);
    }
    let bugres = await ERRORS.find({}, { _id: false, auth: false });
    bugres.filter((bug) => bug);
    if (!config.owners.includes(req.user.id)) {
      return res.redirect('/');
    } else {
      let penbotlist = await BOTS.find(
        { status: 'pending' },
        { _id: false, auth: false },
      ).sort([['descending']]);
      penbotlist.filter((bot) => bot);
      for (i = 0; i < penbotlist.length; i++) {
        await client.users.fetch(penbotlist[i].botid);
      }
      if (req.body.reject) {
        if (
          !client.guilds.cache
            .get(config.guildid)
            .members.cache.get(req.body.reject)
        ) {
          return renderTemplate(res, req, 'panel.ejs', {
            webAdmin: webAdmin,
            reportbug: bugres,
            bots: penbotlist,
            alert: null,
            error: 'Bot is not at server!',
            partners: partners,
            staff_apps: staff_apps,
          });
        }
        BOTS.findOne({ botid: req.body.reject }, async (err, bot) => {
          if (!bot) {
            return renderTemplate(res, req, 'panel.ejs', {
              webAdmin: webAdmin,
              reportbug: bugres,
              bots: penbotlist,
              alert: null,
              error: 'Error occured while rejecting bot!',
              partners: partners,
              staff_apps: staff_apps,
            });
          } else {
            if (bot.status == 'denied')
              return renderTemplate(res, req, 'panel.ejs', {
                webAdmin: webAdmin,
                partners: partners,
                reportbug: bugres,
                bots: penbotlist,
                alert: null,
                error: 'Someone already rejected the bot faster than you!',
                staff_apps: staff_apps,
              });
            var deniedMsg = new MessageEmbed()
              .setTitle('Bot Denied')
              .setColor('#7289DA')
              .setDescription(
                'Whoops, A bot has been rejected, Please make sure you read our rules before you resubmit',
              )
              .addField('Bot', `<@!${req.body.reject}>`)
              .addField('Mod', `<@!${req.user.id}>`)
              .addField('Owner/s', `<@${bot.owner}>`)
              .addField('Reason', `${req.body.reason}`)
              .setTimestamp();
            let theOwner = client.guilds.cache
              .get(config.guildid)
              .members.cache.get(bot.owner);
            theOwner.send(deniedMsg);
            client.guilds.cache
              .get(config.guildid)
              .channels.cache.get(config.botlogs)
              .send(deniedMsg);
            let thebot = client.guilds.cache
              .get(config.guildid)
              .members.cache.get(req.body.reject);
            thebot.kick().catch(() => {});
            bot.status = 'denied';
            bot.date = Date.now();
            await bot.save();
            penbotlist = await BOTS.find(
              { status: 'pending' },
              { _id: false, auth: false },
            ).sort([['descending']]);
            penbotlist.filter((bot) => bot);
            for (i = 0; i < penbotlist.length; i++) {
              await client.users.fetch(penbotlist[i].botid);
            }
            return renderTemplate(res, req, 'panel.ejs', {
              webAdmin: webAdmin,
              reportbug: bugres,
              bots: penbotlist,
              alert: 'Success the bot has been denied!',
              error: null,
              partners: partners,
              staff_apps: staff_apps,
            });
          }
        });
      }
      if (req.body.accept) {
        if (
          !client.guilds.cache
            .get(config.guildid)
            .members.cache.get(req.body.accept)
        ) {
          return renderTemplate(res, req, 'panel.ejs', {
            webAdmin: webAdmin,
            reportbug: bugres,
            bots: penbotlist,
            alert: null,
            error: 'Bot is not at server!',
            partners: partners,
            staff_apps: staff_apps,
          });
        }
        BOTS.findOne({ botid: req.body.accept }, async (err, bot) => {
          if (!bot) {
            return renderTemplate(res, req, 'panel.ejs', {
              webAdmin: webAdmin,
              reportbug: bugres,
              bots: penbotlist,
              alert: null,
              error: 'Error occured while rejecting bot!',
              partners: partners,
              staff_apps: staff_apps,
            });
          } else {
            if (
              !client.guilds.cache
                .get(config.guildid)
                .members.cache.get(bot.owner)
            ) {
              var autoDeny = new MessageEmbed()
                .setTitle('Bot Removed Automatically')
                .setColor('#7289DA')
                .setDescription(
                  'Whoops, Looks like the owner left the server, The bot will now be removed from our list',
                )
                .addField('Bot', `<@!${req.body.accept}>`)
                .addField('Mod', `<@!${req.user.id}>`)
                .addField('Owner/s', `<@${bot.owner}>`)
                .addField('Reason', 'Bot owner is no longer in our server.')
                .setTimestamp();
              let theOwner = client.guilds.cache
                .get(config.guildid)
                .members.cache.get(bot.owner);
              theOwner.send(autoDeny);
              client.guilds.cache
                .get(config.guildid)
                .channels.cache.get(config.botlogs)
                .send(autoDeny);
              let thebot = client.guilds.cache
                .get(config.guildid)
                .members.cache.get(req.body.accept);
              let guild = client.guilds.cache.get(config.guildid);
              let kicked = guild.member(thebot);
              kicked.kick().catch(() => {});
              BOTS.findOne({ botid: req.body.accept }, async (err, bot2) => {
                if (bot2) {
                  bot2.status = 'denied';
                  bot2.date = Date.now();
                  await bot2.save();
                }
              });
              penbotlist = await BOTS.find(
                { status: 'pending' },
                { _id: false, auth: false },
              ).sort([['descending']]);
              penbotlist.filter((bot) => bot);
              return renderTemplate(res, req, 'panel.ejs', {
                webAdmin: webAdmin,
                reportbug: bugres,
                bots: penbotlist,
                alert: null,
                error: 'Bot owner is not at server!, bot got auto rejected',
                partners: partners,
                staff_apps: staff_apps,
              });
            }
            if (bot.status == 'approved')
              return renderTemplate(res, req, 'panel.ejs', {
                webAdmin: webAdmin,
                reportbug: bugres,
                bots: penbotlist,
                alert: null,
                error: 'Someone already approved the bot faster than you!',
                partners: partners,
                staff_apps: staff_apps,
              });
            var approved = new MessageEmbed()
              .setTitle('Bot Approved')
              .setColor('#7289DA')
              .setDescription('🎉🎉🎉')
              .addField('Bot', `<@!${req.body.accept}>`)
              .addField('Mod', `<@!${req.user.id}>`)
              .addField('Owner/s', `<@${bot.owner}>`)
              .addField('Feedback', `${req.body.reason}`)
              .addField(
                'Bot Page',
                `[View it Here](https://paradisebots.net/bots/${req.body.accept})`,
              )
              .setTimestamp();
            let theOwner = client.guilds.cache
              .get(config.guildid)
              .members.cache.get(bot.owner);
            client.guilds.cache
              .get(config.guildid)
              .channels.cache.get(config.botlogs)
              .send(approved);
            theOwner.send(approved);
            bot.status = 'approved';
            bot.date = Date.now();
            await bot.save();
            for (i = 0; i < penbotlist.length; i++) {
              await client.users.fetch(penbotlist[i].botid);
            }
            let thebot = client.guilds.cache
              .get(config.guildid)
              .members.cache.get(req.body.accept);
            let theowner = client.guilds.cache
              .get(config.guildid)
              .members.cache.get(bot.owner);
            let role = client.guilds.cache
              .get(config.guildid)
              .roles.cache.get(config.verifiedbots);
            let role2 = client.guilds.cache
              .get(config.guildid)
              .roles.cache.get(config.pendingbots);
            let role3 = client.guilds.cache
              .get(config.guildid)
              .roles.cache.get(config.verifieddevs);
            thebot.roles.add(role);
            thebot.roles.remove(role2);
            theowner.roles.add(role3);
            penbotlist = await BOTS.find(
              { status: 'pending' },
              { _id: false, auth: false },
            ).sort([['descending']]);
            penbotlist.filter((bot) => bot);
            return renderTemplate(res, req, 'panel.ejs', {
              webAdmin: webAdmin,
              reportbug: bugres,
              bots: penbotlist,
              alert: 'Success the bot has accepted!',
              error: null,
              partners: partners,
              staff_apps: staff_apps,
            });
          }
        });
      }
      let alertmsg = '';
      let errormsg = '';
      if (req.body.acceptbug) {
        ERRORS.findOneAndDelete(
          { userID: req.body.acceptbug },
          async (err, bug) => {
            if (!bug) {
              errormsg = `Error occured while accepting bug !`;
              bugres = await ERRORS.find({}, { _id: false, auth: false });
              bugres.filter((bug) => bug);
              return renderTemplate(res, req, 'panel.ejs', {
                webAdmin: webAdmin,
                reportbug: bugres,
                bots: penbotlist,
                alert: alertmsg,
                error: errormsg,
                partners: partners,
                staff_apps: staff_apps,
              });
            } else {
              alertmsg = `Success accepted the bug (which means fixed)!`;
              bugres = await ERRORS.find({}, { _id: false, auth: false });
              bugres.filter((bug) => bug);
              return renderTemplate(res, req, 'panel.ejs', {
                webAdmin: webAdmin,
                reportbug: bugres,
                bots: penbotlist,
                alert: alertmsg,
                error: errormsg,
                partners: partners,
                staff_apps: staff_apps,
              });
            }
          },
        );
      }
      if (req.body.accept_partner) {
        let user_partner = await partner_app.findOne({
          userID: req.body.accept_partner,
        });

        if (!user_partner) {
          errormsg = `Error occured while accepting app !`;
          await user_partner.deleteOne();
          partners = await partner_app.find({}, { _id: false, auth: false });
          partners.filter((app) => app);
          renderTemplate(res, req, 'panel.ejs', {
            webAdmin: webAdmin,
            reportbug: bugres,
            bots: penbotlist,
            alert: alertmsg,
            error: errormsg,
            partners: partners,
            staff_apps: staff_apps,
          });
        } else {
          alertmsg = `Successful accepted the partner!`;
          await client.guilds.cache
            .get(config.guildid)
            .channels.cache.get('762752184944689192')
            .send(
              `<@${user_partner.userID}> (\`${user_partner.username}\`) partner app has been approved! `,
            );
          let user = await client.users.fetch(user_partner.userID);
          await user
            .send('Your partner app at paradise bot list has been approved')
            .catch(() => {});
          let member = client.guilds.cache
            .get(config.guildid)
            .members.cache.get(user_partner.userID);
          let role = client.guilds.cache
            .get(config.guildid)
            .roles.cache.get('749862856035401807');
          await member.roles.add(role);
          await user_partner.deleteOne();
          partners = await partner_app.find({}, { _id: false, auth: false });
          partners.filter((app) => app);
          renderTemplate(res, req, 'panel.ejs', {
            webAdmin: webAdmin,
            reportbug: bugres,
            bots: penbotlist,
            alert: alertmsg,
            error: errormsg,
            partners: partners,
            staff_apps: staff_apps,
          });
        }
      }
      if (req.body.deny_partner) {
        let user_partner = await partner_app.findOne({
          userID: req.body.deny_partner,
        });

        if (!user_partner) {
          errormsg = `Error occured while deny app !`;
          await user_partner.deleteOne();
          partners = await partner_app.find({}, { _id: false, auth: false });
          partners.filter((app) => app);
          return renderTemplate(res, req, 'panel.ejs', {
            webAdmin: webAdmin,
            reportbug: bugres,
            bots: penbotlist,
            alert: alertmsg,
            error: errormsg,
            partners: partners,
            staff_apps: staff_apps,
          });
        } else {
          alertmsg = `Successful denied the partner!`;
          await client.guilds.cache
            .get(config.guildid)
            .channels.cache.get('762752184944689192')
            .send(
              `<@${user_partner.userID}> (\`${user_partner.username}\`) partner app has been denied! by: <@${req.user.id}>, Please contact this Staff Member for more info.`,
            );
          let user = await client.users.fetch(user_partner.userID);
          await user
            .send(
              `Your partner app at paradise bot list has been denied by: <@${req.user.id}>(${req.user.username}), Please contact this Staff Member for more info`,
            )
            .catch(() => {});
          await user_partner.deleteOne();
          partners = await partner_app.find({}, { _id: false, auth: false });
          partners.filter((app) => app);
          return renderTemplate(res, req, 'panel.ejs', {
            webAdmin: webAdmin,
            reportbug: bugres,
            bots: penbotlist,
            alert: alertmsg,
            error: errormsg,
            partners: partners,
            staff_apps: staff_apps,
          });
        }
      }
      if (req.body.accept_staff) {
        let new_staff = await staff_app.findOne({
          userID: req.body.accept_staff,
        });

        if (!new_staff) {
          errormsg = `Error occured while accepting the new staff !`;
          await new_staff.deleteOne();
          staff_apps = await staff_app.find({}, { _id: false, auth: false });
          staff_apps.filter((app) => app);
          renderTemplate(res, req, 'panel.ejs', {
            webAdmin: webAdmin,
            reportbug: bugres,
            bots: penbotlist,
            alert: alertmsg,
            error: errormsg,
            partners: partners,
            staff_apps: staff_apps,
          });
        } else {
          alertmsg = `Successful accepted the new staff member!`;
          await client.guilds.cache
            .get(config.guildid)
            .channels.cache.get('762752184944689192')
            .send(
              `<@${new_staff.userID}> (\`${
                new_staff.username
              }\`) staff app has been approved with **${
                client.guilds.cache
                  .get(client.config.guildid)
                  .roles.cache.get(new_staff.position).name
              }** position!`,
            );
          let user = await client.users.fetch(new_staff.userID);
          await user
            .send('Your staff app at paradise bot list has been approved')
            .catch(() => {});
          let member = client.guilds.cache
            .get(config.guildid)
            .members.cache.get(new_staff.userID);
          let role = client.guilds.cache
            .get(config.guildid)
            .roles.cache.get(new_staff.position);
          await member.roles.add(role);
          await new_staff.deleteOne();
          staff_apps = await staff_app.find({}, { _id: false, auth: false });
          staff_apps.filter((app) => app);
          renderTemplate(res, req, 'panel.ejs', {
            webAdmin: webAdmin,
            reportbug: bugres,
            bots: penbotlist,
            alert: alertmsg,
            error: errormsg,
            partners: partners,
            staff_apps: staff_apps,
          });
        }
      }
      if (req.body.deny_staff) {
        let staff = await staff_app.findOne({ userID: req.body.deny_staff });

        if (!staff) {
          errormsg = `Error occured while deny the staff app !`;
          await staff.deleteOne();
          staff_apps = await staff_app.find({}, { _id: false, auth: false });
          staff_apps.filter((app) => app);
          return renderTemplate(res, req, 'panel.ejs', {
            webAdmin: webAdmin,
            reportbug: bugres,
            bots: penbotlist,
            alert: alertmsg,
            error: errormsg,
            partners: partners,
            staff_apps: staff_apps,
          });
        } else {
          alertmsg = `Successful denied the staff app!`;
          await client.guilds.cache
            .get(config.guildid)
            .channels.cache.get('762752184944689192')
            .send(
              `<@${staff.userID}> (\`${staff.username}\`) staff app has been denied! by: <@${req.user.id}>, Please contact this Staff Member for more info.`,
            );
          let user = await client.users.fetch(staff.userID);
          await user
            .send(
              `Your staff app at paradise bot list has been denied by: <@${req.user.id}>(${req.user.username}), Please contact this Staff Member for more info`,
            )
            .catch(() => {});
          await staff.deleteOne();
          staff_apps = await staff_app.find({}, { _id: false, auth: false });
          staff_apps.filter((app) => app);
          return renderTemplate(res, req, 'panel.ejs', {
            webAdmin: webAdmin,
            reportbug: bugres,
            bots: penbotlist,
            alert: alertmsg,
            error: errormsg,
            partners: partners,
            staff_apps: staff_apps,
          });
        }
      }
    }
  });

  //Adding bots through post request
  app.post('/add', checkAuth, async (req, res, next) => {
    let errormsg = '';
    let alertmsg = '';
    let guild = client.guilds.cache.get(config.guildid);
    let bot = await BOTS.findOne({ botid: req.body.clientid });
    let newbot = await client.users.fetch(req.body.clientid).catch(() => {});
    let additionalOwners = req.body.additionals.split(' ');
    let avatar =
      'https://maxcdn.icons8.com/Share/icon/Logos/discord_logo1600.png';
    let text = req.body.tags;
    let tags2 = '';

    //Check if bot exists
    if (bot) errormsg = 'The bot is already exists!';
    //Check if fetched or no
    else if (!newbot) errormsg = "Couldn't fetch the bot!";
    //Check if noy
    else if (!newbot.bot) errormsg = "You can't add human as bots!";
    //Guild Error
    else if (!guild.members.cache.get(req.user.id))
      errormsg = 'You are not in our server!';
    //Short Description
    else if (req.body.shortdesc.length > 150)
      errormsg =
        "Short Description: Short description can't be more than 150 charactars";
    else if (req.body.shortdesc.length < 10)
      errormsg =
        "Short Description: Short description can't be less than 10 charactars";
    else if (req.body.shortdesc.includes('https://discord.com'))
      errormsg = 'Invite Link.. in the Short Description? NO!!!';
    //Long Desc Length
    else if (req.body.longdesc.length < 300)
      errormsg =
        "Long Description: Long description can't be less than 300 charactars";
    //Prefix length
    else if (req.body.prefix.length > 20)
      errormsg = "Prefix: prefix can't be more than 20 charactars";
    //html in short description
    else if (ishtml(req.body.shortdesc))
      errormsg =
        'Short Description: HTML is not supported at short description!';
    //Additional owners
    else if (additionalOwners.includes(req.user.id))
      errormsg = "Additional Owners: You don't need to add yourself!";
    //Check tags length
    else if (text.toString().split(',').length > 4)
      errormsg = 'Tags : Max tags is 4';
    //javascript in long description
    /*if (isjs(req.body.longdesc)) errormsg = "Long Description: JavaScript is not supported in the long description!"*/
    //javascript in short description
    /*if (isjs(req.body.shortdesc)) errormsg = "Short Description: JavaScript is not supported in the short description!"*/ else {
      if (newbot.avatar)
        avatar = `https://cdn.discordapp.com/avatars/${req.body.clientid}/${newbot.avatar}.png?size=256`;

      await new BOTS({
        botid: req.body.clientid,
        owner: req.user.id,
        username: newbot.username,
        additionalOwners: additionalOwners || [],
        prefix: req.body.prefix,
        short: req.body.shortdesc,
        long: req.body.longdesc,
        invite:
          req.body.botinvite ||
          `https://discord.com/oauth2/authorize?client_id=${req.body.clientid}&permissions=0&scope=bot`,
        votes: 0,
        avatar: avatar,
        status: 'pending',
        vanity: newbot.username.split(' ').join('-').toLowerCase(),
        serverlink: req.body.serverinvite || 'https://discord.gg/Cqy99Pt',
        website: req.body.website || 'https://paradisebots.net/',
        github: req.body.github || 'IE: https://github.com',
        donate: req.body.donateurl || 'https://paypal.me/',
        tags: text.toString().split(',').join(', '),
        library: req.body.library || 'None',
        date: Date.now(),
        webhook: req.body.webhook,
        banner: req.body.botbanner || 'https://i.imgur.com/d0kPown.jpg',
        servers: 0,
        shards: 0,
        auth:
          Math.random()
            .toString(36)
            .replace(/[^a-z]+/g, '')
            .substr(0, 15) +
          Math.ceil(Math.random() * 52520) +
          Math.random()
            .toString(36)
            .replace(/[^a-z]+/g, '')
            .substr(0, 15) +
          Math.ceil(Math.random() * 52520) +
          Math.random()
            .toString(36)
            .replace(/[^a-z]+/g, '')
            .substr(0, 15),
      }).save();

      let r = client.guilds.cache
        .get(config.guildid)
        .roles.cache.find((r) => r.id === config.staff);
      let r2 = client.guilds.cache
        .get(config.guildid)
        .roles.cache.find((r) => r.id === config.staffTrial);
      await r.setMentionable(true);
      await r2.setMentionable(true);
      let botOwner = client.guilds.cache
        .get(config.guildid)
        .members.cache.get(req.user.id);

      var e = new MessageEmbed();
      e.setTitle('New Bot Submitted');
      e.setColor('#7289DA');
      e.addField('Bot', `<@!${req.body.clientid}>`);
      e.addField('Owner/s', `<@!${req.user.id}>`);
      e.addField(
        'Bot Page',
        `[View it Here](https://paradisebots.net/bots/${req.body.clientid})`,
      );
      e.addField(
        'Invite (Perms=0)',
        '[Invite](https://discord.com/oauth2/authorize?client_id=${req.body.clientid}&scope=bot&guild_id=${process.env.GUILD_ID}&permissions=0)',
      );
      e.setTimestamp();

      var e2 = new MessageEmbed();
      e2.setTitle('Bot Submitted');
      e2.setColor('#7289DA');
      e2.setDescription(
        'Your bot has been submitted, Please be patient we will review it as soon as possible',
      );
      e2.setTimestamp();

      //Send embeds to user and to log channel
      await client.guilds.cache
        .get(config.guildid)
        .channels.cache.get(config.botlogs)
        .send(`${r} || ${r2}`);
      client.guilds.cache
        .get(config.guildid)
        .channels.cache.get(config.botlogs)
        .send(e);
      botOwner.send(e2);
      r.setMentionable(false);
      alertmsg =
        'Your bot application has been sent, be patient while we are reviewing!';
    }
    renderTemplate(res, req, 'bots/add.ejs', {
      alert: alertmsg,
      error: errormsg,
    });
  });

  app.get('/reports/bug', checkAuth, (req, res, next) => {
    renderTemplate(res, req, 'reports/bug.ejs', { alert: null, error: null });
  });
  app.post('/reports/bug', checkAuth, async (req, res, next) => {
    // We validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
    let alertmsg = '';
    let errormsg = '';
    if (ratelimit.has(req.user.id + 'bug')) {
      errormsg = 'Ratelimited, come back after 1 min';
    } else {
      // We retrive the settings stored for this guild.
      if (req.body.reportbug.length > 500) {
        errormsg = 'Max characters exceeded! (500 char)';
      } else if (req.body.reportbug.length < 25) {
        errormsg = 'Brief report in more than 25 char';
      } else {
        ratelimit.add(req.user.id + 'bug');
        const newbug = new ERRORS({
          userID: req.user.id,
          bug: req.body.reportbug,
        });
        newbug.save().catch(() => {});
        alertmsg = 'Your bug report has been submited and will be reviewed!';

        let theActualUser = client.users.cache.get(req.user.id).username;

        let bugEmbed = new MessageEmbed()
          .setTitle('🐞 Bug Report Submitted 🐞')
          .setDescription(`${theActualUser} Has submitted a new Bug Report`)
          .addField('Reported Bug', `${req.body.reportbug}`)
          .setColor('#7289DA')
          .setFooter(
            '© Paradise Bots | 2020',
            'https://i.imgur.com/Df2seyl.png',
          );
        client.guilds.cache
          .get(config.guildid)
          .channels.cache.get(config.reportslog)
          .send(bugEmbed);
        setTimeout(() => {
          ratelimit.delete(req.user.id + 'bug');
        }, 60000);
      }
    }
    renderTemplate(res, req, 'reports/bug.ejs', {
      alert: `${alertmsg}`,
      error: `${errormsg}`,
    });
  });

  // certification bot
  app.get('/certification', checkAuth, async (req, res, next) => {
    const bots = await BOTS.find({ owner: req.user.id, status: 'approved' });
    console.log(bots);
    renderTemplate(res, req, 'applications/certification.ejs', {
      alert: null,
      error: null,
      bots,
    });
  });
  // Dashboard endpoint.
  app.get('/bots/:botid/resubmit', checkAuth, async (req, res, next) => {
    BOTS.findOne(
      {
        botid: req.params.botid,
        status: 'denied',
      },
      async (err, bot) => {
        if (!bot) return res.redirect('/error');

        if (
          bot.owner !== req.user.id &&
          !bot.additionalOwners.includes(req.user.id)
        )
          return res.redirect('/error');

        const botlist = await BOTS.findOne(
          { botid: req.params.botid },
          { _id: false, auth: false },
        );

        renderTemplate(res, req, 'bots/resubmit.ejs', {
          bots: botlist,
          alert: null,
          error: null,
        });
      },
    );
  });
  //certification bot
  app.post('/certification', checkAuth, async (req, res, next) => {
    let alertmsg;
    let errormsg;
    console.log(req.body.botID);
    if (req.body.submit) {
      let bot = await BOTS.findOne({ botid: req.body.botID });
      if (!bot) errormsg = 'Error occured while certification';
      else if (
        !client.guilds.cache.get(config.guildid).members.cache.get(req.user.id)
      )
        errormsg = 'You are not in the support server';
      else if (bot.owner !== req.user.id)
        errormsg = 'You are not the owner of this bot';
      else if (bot.status !== 'approved') errormsg = 'This bot is at queue';
      else if (
        !client.guilds.cache.get(config.guildid).members.cache.get(bot.botid)
      )
        errormsg = "This bot isn't at server ask staff to add";
      else if (bot.pending_cert)
        errormsg = 'This bot is awaiting certification';
      else if (bot.is_certified) errormsg = 'This bot is already certified';
      else if (bot.certifiedBot === 'certified')
        errormsg = 'This bot is already certified';
      else if (!bot.votes >= 15)
        errormsg = "Your bot doesn't have enough votes.";
      else if (!bot.servers >= 75)
        errormsg = 'Your bot is not in 75 or more servers.';
      else {
        bot.pending_cert = true;
        await bot.save();
        alertmsg = `Your bot has been added to certification queue`;
        let adminRole = client.guilds.cache
          .get(config.guildid)
          .roles.cache.find((r) => r.id === config.web_admin);
        await client.guilds.cache
          .get(config.guildid)
          .channels.cache.get(config.botlogs)
          .send(`${adminRole}`);
        client.guilds.cache
          .get(config.guildid)
          .channels.cache.get(config.botlogs)
          .send(
            `<@${req.user.id}> added <@${bot.botid}> (\`${bot.username}\`) for certification`,
          );
      }
    }
    let bots = await BOTS.find({
      owner: req.user.id,
      status: 'approved',
      pending_cert: false,
      is_certified: false,
    });
    renderTemplate(res, req, 'applications/certification.ejs', {
      alert: alertmsg,
      error: errormsg,
      bots,
    });
  });
  //certification panel
  app.post('/panel/certification', checkAuth, async (req, res, next) => {
    if (!config.owners.includes(req.user.id)) return res.redirect('/');
    let alertmsg;
    let errormsg;
    if (req.body.certify) {
      let bot = await BOTS.findOne({ botid: req.body.certify });
      let user = await USERS.findOne({ userID: bot.owner });
      if (!bot) errormsg = 'Error occured while certification';
      else if (bot.owner === req.user.id)
        errormsg = "You can't certify your own bot LOL";
      else if (
        !client.guilds.cache.get(config.guildid).members.cache.get(bot.owner)
      )
        errormsg = 'Owner not in the support server';
      else if (bot.is_certified) errormsg = 'Bot it already certified!';
      else if (
        !client.guilds.cache.get(config.guildid).members.cache.get(bot.botid)
      )
        errormsg = "This bot isn't at server add it";
      else if (!bot.pending_cert)
        errormsg = 'This bot is not awaiting certification';
      else if (req.user.id === bot.owner)
        errormsg = 'You can not certify your own bot 🤦🏻‍♂️';
      else {
        bot.certifiedBot = 'certified';
        bot.pending_cert = false;
        bot.is_certified = true;
        user.certifiedUser = true;
        await bot.save();
        await user.save();
        alertmsg = `${bot.username} has been certified!`;
        let member = client.guilds.cache
          .get(config.guildid)
          .members.cache.get(bot.owner);
        let da_bot = client.guilds.cache
          .get(config.guildid)
          .members.cache.get(bot.botid);
        let dev_role = client.guilds.cache
          .get(config.guildid)
          .roles.cache.get(client.config.certified_devs);
        let bot_role = client.guilds.cache
          .get(config.guildid)
          .roles.cache.get(client.config.certified_bots);
        await member.roles.add(dev_role);
        await da_bot.roles.add(bot_role);
        client.guilds.cache
          .get(config.guildid)
          .channels.cache.get(config.botlogs)
          .send(
            `<@${bot.botid}> by <@${bot.owner}> got certified by <@${req.user.id}>`,
          );
      }
    } else if (req.body.uncertify) {
      let bot = await BOTS.findOne({ botid: req.body.uncertify });
      if (!bot) errormsg = 'Error occured while uncertification';
      else if (
        !client.guilds.cache.get(config.guildid).members.cache.get(bot.botid)
      )
        errormsg = "This bot isn't at server add it";
      else if (!bot.pending_cert)
        errormsg = 'This bot is not awaiting certification';
      else {
        bot.pending_cert = false;
        await bot.save();
        alertmsg = `${bot.username} has been uncertified!`;
        client.guilds.cache
          .get(config.guildid)
          .channels.cache.get(config.botlogs)
          .send(
            `<@${bot.botid}> by <@${bot.owner}> certification got denied by <@${req.user.id}>`,
          );
      }
    }
    let bots = await BOTS.find({
      owner: req.user.id,
      status: 'approved',
      pending_cert: true,
      certified: false,
    });
    renderTemplate(res, req, 'panel/certification.ejs', {
      alert: alertmsg,
      error: errormsg,
      certification_bots: bots,
    });
  });
  app.get('/panel/certification', checkAuth, async (req, res, next) => {
    if (!config.owners.includes(req.user.id)) return res.redirect('/');
    let bots = await BOTS.find({ pending_cert: true });
    for (i = 0; i < bots.length; i++) {
      await client.users.fetch(bots[i].botid);
    }
    renderTemplate(res, req, 'panel/certification.ejs', {
      alert: null,
      error: null,
      certification_bots: bots,
    });
  });

  // Web Admin Panel
  app.get('/panel/admin', checkAuth, async (req, res, next) => {
    let webAdmin = req.user.id;

    if (!config.higherStaff.includes(req.user.id)) {
      return res.redirect('/');
    } else {
      const penbotlist = await BOTS.find(
        { status: 'pending' },
        { _id: false, auth: false },
      ).sort([['descending']]);
      penbotlist.filter((bot) => bot);
      for (i = 0; i < penbotlist.length; i++) {
        await client.users.fetch(penbotlist[i].botid);
      }
      const bugres = await ERRORS.find({}, { _id: false, auth: false });
      bugres.filter((bug) => bug);
      const partners = await partner_app.find({}, { _id: false, auth: false });
      partners.filter((app) => app);
      for (i = 0; i < partners.length; i++) {
        await client.users.fetch(partners[i].userID);
      }
      const staff_apps = await staff_app.find({}, { _id: false, auth: false });
      staff_apps.filter((app) => app);
      for (i = 0; i < staff_apps.length; i++) {
        await client.users.fetch(staff_apps[i].userID);
      }
      renderTemplate(res, req, 'panel/admin.ejs', {
        webAdmin: webAdmin,
        bots: penbotlist,
        alert: null,
        error: null,
        reportbug: bugres,
        partners: partners,
        staff_apps: staff_apps,
      });
    }
  });
  app.post('/panel/admin', checkAuth, async (req, res, next) => {
    const webAdmin = req.user.id;

    let partners = await partner_app.find({}, { _id: false, auth: false });
    partners.filter((app) => app);
    for (i = 0; i < partners.length; i++) {
      await client.users.fetch(partners[i].userID);
    }
    let staff_apps = await staff_app.find({}, { _id: false, auth: false });
    staff_apps.filter((app) => app);
    for (i = 0; i < staff_apps.length; i++) {
      await client.users.fetch(staff_apps[i].userID);
    }
    let bugres = await ERRORS.find({}, { _id: false, auth: false });
    bugres.filter((bug) => bug);
    if (!config.higherStaff.includes(req.user.id)) {
      return res.redirect('/');
    } else {
      let penbotlist = await BOTS.find(
        { status: 'pending' },
        { _id: false, auth: false },
      ).sort([['descending']]);
      penbotlist.filter((bot) => bot);
      for (i = 0; i < penbotlist.length; i++) {
        await client.users.fetch(penbotlist[i].botid);
      }
      if (req.body.checkingtransfer) {
        BOTS.findOne({ botid: req.body.clientid }, async (err, bot7) => {
          let newOwner = await USERS.findOne({ userID: req.body.userid });

          let botCheck = client.guilds.cache
            .get(config.guildid)
            .members.cache.get(bot7.botid);

          let ownerCheck = client.guilds.cache
            .get(config.guildid)
            .members.cache.get(req.body.userid);

          if (!botCheck) {
            return renderTemplate(res, req, 'panel/admin.ejs', {
              webAdmin: webAdmin,
              bots: penbotlist,
              alert: null,
              error: 'That bot is not a member of our server',
              partners: partners,
              staff_apps: staff_apps,
            });
          }

          if (!ownerCheck) {
            return renderTemplate(res, req, 'panel/admin.ejs', {
              webAdmin: webAdmin,
              bots: penbotlist,
              alert: null,
              error: 'That user is not a member of our server.',
              partners: partners,
              staff_apps: staff_apps,
            });
          }

          if (ownerCheck.bot) {
            return renderTemplate(res, req, 'panel/admin.ejs', {
              webAdmin: webAdmin,
              bots: penbotlist,
              alert: null,
              error: 'You cannot add a bot as owner.',
              partners: partners,
              staff_apps: staff_apps,
            });
          }

          if (req.body.userid === req.body.clientid) {
            return renderTemplate(res, req, 'panel/admin.ejs', {
              webAdmin: webAdmin,
              bots: penbotlist,
              alert: null,
              error: "Wait what!! What did you do!!! A Bot can't own a bot",
              partners: partners,
              staff_apps: staff_apps,
            });
          }

          if (!newOwner) {
            return renderTemplate(res, req, 'panel/admin.ejs', {
              webAdmin: webAdmin,
              bots: penbotlist,
              alert: null,
              error: 'That user does not exist in our database',
              partners: partners,
              staff_apps: staff_apps,
            });
          }

          if (!bot7) {
            return renderTemplate(res, req, 'panel/admin.ejs', {
              webAdmin: webAdmin,
              bots: penbotlist,
              alert: null,
              error: 'That bot does not exist in our database',
              partners: partners,
              staff_apps: staff_apps,
            });
          } else {
            client.guilds.cache
              .get(config.guildid)
              .channels.cache.get(config.botlogs)
              .send(
                `<@${req.body.clientid}> has been transferred  by <@${req.user.id}> (<@${bot7.owner}>)\nReason: **${req.body.transferreason}**`,
              );
            let thebot4 = client.guilds.cache
              .get(config.guildid)
              .members.cache.get(req.body.clientid);
            bot7.owner = newOwner.userID;
            await bot7.save();
            penbotlist = await BOTS.find(
              { status: 'pending' },
              { _id: false, auth: false },
            ).sort([['descending']]);
            penbotlist.filter((bot) => bot);
            for (i = 0; i < penbotlist.length; i++) {
              await client.users.fetch(penbotlist[i].botid);
            }
            return renderTemplate(res, req, 'panel/admin.ejs', {
              newOwer: newOwner,
              webAdmin: webAdmin,
              reportbug: bugres,
              bots: penbotlist,
              alert: 'Successfully the bot has been transferred!',
              error: null,
              partners: partners,
              staff_apps: staff_apps,
            });
          }
        });
      }
      if (req.body.checkingdelete) {
        BOTS.findOne({ botid: req.body.clientid }, async (err, bot3) => {
          if (!bot3) {
            return renderTemplate(res, req, 'panel/admin.ejs', {
              webAdmin: webAdmin,
              reportbug: bugres,
              bots: penbotlist,
              alert: null,
              error: 'That bot does not exist in our database',
              partners: partners,
              staff_apps: staff_apps,
            });
          } else {
            client.guilds.cache
              .get(config.guildid)
              .channels.cache.get(config.botlogs)
              .send(
                `<@${req.body.clientid}> has been deleted by <@${req.user.id}> (<@${bot3.owner}>)\nReason: **${req.body.deletereason}**`,
              );
            if (
              client.guilds.cache
                .get(config.guildid)
                .members.cache.get(req.body.clientid)
            ) {
              let thebot2 = client.guilds.cache
                .get(config.guildid)
                .members.cache.get(req.body.clientid);
              thebot2.kick().catch(() => {});
            }
            BOTS.find(
              {
                owner: bot3.owner,
                status: 'approved',
              },
              (err, bot4) => {
                if (bot4.length <= 1) {
                  let theowner = client.guilds.cache
                    .get(config.guildid)
                    .members.cache.get(bot3.owner);
                  let role3 = client.guilds.cache
                    .get(config.guildid)
                    .roles.cache.get(config.verifieddevs);
                  theowner.roles.remove(role3);
                }
              },
            );
            bot3.status = 'denied';
            bot3.date = Date.now();
            await bot3.save();
            penbotlist = await BOTS.find(
              { status: 'pending' },
              { _id: false, auth: false },
            ).sort([['descending']]);
            penbotlist.filter((bot) => bot);
            for (i = 0; i < penbotlist.length; i++) {
              await client.users.fetch(penbotlist[i].botid);
            }
            return renderTemplate(res, req, 'panel/admin.ejs', {
              webAdmin: webAdmin,
              reportbug: bugres,
              bots: penbotlist,
              alert: 'Successfully the bot has been deleted!',
              error: null,
              partners: partners,
              staff_apps: staff_apps,
            });
          }
        });
      }
      if (req.body.reject) {
        if (
          !client.guilds.cache
            .get(config.guildid)
            .members.cache.get(req.body.reject)
        ) {
          return renderTemplate(res, req, 'panel/admin.ejs', {
            webAdmin: webAdmin,
            reportbug: bugres,
            bots: penbotlist,
            alert: null,
            error: 'Bot is not at server!',
            partners: partners,
            staff_apps: staff_apps,
          });
        }
        BOTS.findOne({ botid: req.body.reject }, async (err, bot) => {
          if (!bot) {
            return renderTemplate(res, req, 'panel/admin.ejs', {
              webAdmin: webAdmin,
              reportbug: bugres,
              bots: penbotlist,
              alert: null,
              error: 'Error occured while rejecting bot!',
              partners: partners,
              staff_apps: staff_apps,
            });
          } else {
            if (bot.status == 'denied')
              return renderTemplate(res, req, 'panel/admin.ejs', {
                webAdmin: webAdmin,
                partners: partners,
                reportbug: bugres,
                bots: penbotlist,
                alert: null,
                error: 'Someone already rejected the bot faster than you!',
                staff_apps: staff_apps,
              });
            var deniedMsg = new MessageEmbed()
              .setTitle('Bot Denied')
              .setColor('#7289DA')
              .setDescription(
                'Whoops, A bot has been rejected, Please make sure you read our rules before you resubmit',
              )
              .addField('Bot', `<@!${req.body.reject}>`)
              .addField('Mod', `<@!${req.user.id}>`)
              .addField('Owner/s', `<@${bot.owner}>`)
              .addField('Reason', `${req.body.reason}`)
              .setTimestamp();
            let theOwner = client.guilds.cache
              .get(config.guildid)
              .members.cache.get(bot.owner);
            theOwner.send(deniedMsg);
            client.guilds.cache
              .get(config.guildid)
              .channels.cache.get(config.botlogs)
              .send(deniedMsg);
            let thebot = client.guilds.cache
              .get(config.guildid)
              .members.cache.get(req.body.reject);
            thebot.kick().catch(() => {});
            bot.status = 'denied';
            bot.date = Date.now();
            await bot.save();
            penbotlist = await BOTS.find(
              { status: 'pending' },
              { _id: false, auth: false },
            ).sort([['descending']]);
            penbotlist.filter((bot) => bot);
            for (i = 0; i < penbotlist.length; i++) {
              await client.users.fetch(penbotlist[i].botid);
            }
            return renderTemplate(res, req, 'panel/admin.ejs', {
              webAdmin: webAdmin,
              reportbug: bugres,
              bots: penbotlist,
              alert: 'Success the bot has been denied!',
              error: null,
              partners: partners,
              staff_apps: staff_apps,
            });
          }
        });
      }
      if (req.body.accept) {
        if (
          !client.guilds.cache
            .get(config.guildid)
            .members.cache.get(req.body.accept)
        ) {
          return renderTemplate(res, req, 'panel/admin.ejs', {
            webAdmin: webAdmin,
            reportbug: bugres,
            bots: penbotlist,
            alert: null,
            error: 'Bot is not at server!',
            partners: partners,
            staff_apps: staff_apps,
          });
        }
        BOTS.findOne({ botid: req.body.accept }, async (err, bot) => {
          if (!bot) {
            return renderTemplate(res, req, 'panel/admin.ejs', {
              webAdmin: webAdmin,
              reportbug: bugres,
              bots: penbotlist,
              alert: null,
              error: 'Error occured while rejecting bot!',
              partners: partners,
              staff_apps: staff_apps,
            });
          } else {
            if (
              !client.guilds.cache
                .get(config.guildid)
                .members.cache.get(bot.owner)
            ) {
              var autoDeny = new MessageEmbed()
                .setTitle('Bot Removed Automatically')
                .setColor('#7289DA')
                .setDescription(
                  'Whoops, Looks like the owner left the server, The bot will now be removed from our list',
                )
                .addField('Bot', `<@!${req.body.accept}>`)
                .addField('Mod', `<@!${req.user.id}>`)
                .addField('Owner/s', `<@${bot.owner}>`)
                .addField('Reason', 'Bot owner is no longer in our server.')
                .setTimestamp();
              let theOwner = client.guilds.cache
                .get(config.guildid)
                .members.cache.get(bot.owner);
              theOwner.send(autoDeny);
              client.guilds.cache
                .get(config.guildid)
                .channels.cache.get(config.botlogs)
                .send(autoDeny);
              let thebot = client.guilds.cache
                .get(config.guildid)
                .members.cache.get(req.body.accept);
              let guild = client.guilds.cache.get(config.guildid);
              let kicked = guild.member(thebot);
              kicked.kick().catch(() => {});
              BOTS.findOne({ botid: req.body.accept }, async (err, bot2) => {
                if (bot2) {
                  bot2.status = 'denied';
                  bot2.date = Date.now();
                  await bot2.save();
                }
              });
              penbotlist = await BOTS.find(
                { status: 'pending' },
                { _id: false, auth: false },
              ).sort([['descending']]);
              penbotlist.filter((bot) => bot);
              return renderTemplate(res, req, 'panel/admin.ejs', {
                webAdmin: webAdmin,
                reportbug: bugres,
                bots: penbotlist,
                alert: null,
                error: 'Bot owner is not at server!, bot got auto rejected',
                partners: partners,
                staff_apps: staff_apps,
              });
            }
            if (bot.status == 'approved')
              return renderTemplate(res, req, 'panel.ejs', {
                webAdmin: webAdmin,
                reportbug: bugres,
                bots: penbotlist,
                alert: null,
                error: 'Someone already approved the bot faster than you!',
                partners: partners,
                staff_apps: staff_apps,
              });
            var approved = new MessageEmbed()
              .setTitle('Bot Approved')
              .setColor('#7289DA')
              .setDescription('🎉🎉🎉')
              .addField('Bot', `<@!${req.body.accept}>`)
              .addField('Mod', `<@!${req.user.id}>`)
              .addField('Owner/s', `<@${bot.owner}>`)
              .addField('Feedback', `${req.body.reason}`)
              .addField(
                'Bot Page',
                `[View it Here](https://paradisebots.net/bots/${req.body.accept})`,
              )
              .setTimestamp();
            let theOwner = client.guilds.cache
              .get(config.guildid)
              .members.cache.get(bot.owner);
            client.guilds.cache
              .get(config.guildid)
              .channels.cache.get(config.botlogs)
              .send(approved);
            theOwner.send(approved);
            bot.status = 'approved';
            bot.date = Date.now();
            await bot.save();
            for (i = 0; i < penbotlist.length; i++) {
              await client.users.fetch(penbotlist[i].botid);
            }
            let thebot = client.guilds.cache
              .get(config.guildid)
              .members.cache.get(req.body.accept);
            let theowner = client.guilds.cache
              .get(config.guildid)
              .members.cache.get(bot.owner);
            let role = client.guilds.cache
              .get(config.guildid)
              .roles.cache.get(config.verifiedbots);
            let role2 = client.guilds.cache
              .get(config.guildid)
              .roles.cache.get(config.pendingbots);
            let role3 = client.guilds.cache
              .get(config.guildid)
              .roles.cache.get(config.verifieddevs);
            thebot.roles.add(role);
            thebot.roles.remove(role2);
            theowner.roles.add(role3);
            penbotlist = await BOTS.find(
              { status: 'pending' },
              { _id: false, auth: false },
            ).sort([['descending']]);
            penbotlist.filter((bot) => bot);
            return renderTemplate(res, req, 'panel/admin.ejs', {
              webAdmin: webAdmin,
              reportbug: bugres,
              bots: penbotlist,
              alert: 'Success the bot has accepted!',
              error: null,
              partners: partners,
              staff_apps: staff_apps,
            });
          }
        });
      }
      let alertmsg = '';
      let errormsg = '';
      if (req.body.acceptbug) {
        ERRORS.findOneAndDelete(
          { userID: req.body.acceptbug },
          async (err, bug) => {
            if (!bug) {
              errormsg = `Error occured while accepting bug !`;
              bugres = await ERRORS.find({}, { _id: false, auth: false });
              bugres.filter((bug) => bug);
              return renderTemplate(res, req, 'panel/admin.ejs', {
                webAdmin: webAdmin,
                reportbug: bugres,
                bots: penbotlist,
                alert: alertmsg,
                error: errormsg,
                partners: partners,
                staff_apps: staff_apps,
              });
            } else {
              alertmsg = `Success accepted the bug (which means fixed)!`;
              bugres = await ERRORS.find({}, { _id: false, auth: false });
              bugres.filter((bug) => bug);
              return renderTemplate(res, req, 'panel/admin.ejs', {
                webAdmin: webAdmin,
                reportbug: bugres,
                bots: penbotlist,
                alert: alertmsg,
                error: errormsg,
                partners: partners,
                staff_apps: staff_apps,
              });
            }
          },
        );
      }
      if (req.body.accept_partner) {
        let user_partner = await partner_app.findOne({
          userID: req.body.accept_partner,
        });

        if (!user_partner) {
          errormsg = `Error occured while accepting app !`;
          await user_partner.deleteOne();
          partners = await partner_app.find({}, { _id: false, auth: false });
          partners.filter((app) => app);
          renderTemplate(res, req, 'panel/admin.ejs', {
            webAdmin: webAdmin,
            reportbug: bugres,
            bots: penbotlist,
            alert: alertmsg,
            error: errormsg,
            partners: partners,
            staff_apps: staff_apps,
          });
        } else {
          alertmsg = `Successful accepted the partner!`;
          await client.guilds.cache
            .get(config.guildid)
            .channels.cache.get('762752184944689192')
            .send(
              `<@${user_partner.userID}> (\`${user_partner.username}\`) partner app has been approved! `,
            );
          let user = await client.users.fetch(user_partner.userID);
          await user
            .send('Your partner app at paradise bot list has been approved')
            .catch(() => {});
          let member = client.guilds.cache
            .get(config.guildid)
            .members.cache.get(user_partner.userID);
          let role = client.guilds.cache
            .get(config.guildid)
            .roles.cache.get('749862856035401807');
          await member.roles.add(role);
          await user_partner.deleteOne();
          partners = await partner_app.find({}, { _id: false, auth: false });
          partners.filter((app) => app);
          renderTemplate(res, req, 'panel/admin.ejs', {
            webAdmin: webAdmin,
            reportbug: bugres,
            bots: penbotlist,
            alert: alertmsg,
            error: errormsg,
            partners: partners,
            staff_apps: staff_apps,
          });
        }
      }
      if (req.body.deny_partner) {
        let user_partner = await partner_app.findOne({
          userID: req.body.deny_partner,
        });

        if (!user_partner) {
          errormsg = `Error occured while deny app !`;
          await user_partner.deleteOne();
          partners = await partner_app.find({}, { _id: false, auth: false });
          partners.filter((app) => app);
          return renderTemplate(res, req, 'panel/admin.ejs', {
            webAdmin: webAdmin,
            reportbug: bugres,
            bots: penbotlist,
            alert: alertmsg,
            error: errormsg,
            partners: partners,
            staff_apps: staff_apps,
          });
        } else {
          alertmsg = `Successful denied the partner!`;
          await client.guilds.cache
            .get(config.guildid)
            .channels.cache.get('762752184944689192')
            .send(
              `<@${user_partner.userID}> (\`${user_partner.username}\`) partner app has been denied! by: <@${req.user.id}>, Please contact this Staff Member for more info.`,
            );
          let user = await client.users.fetch(user_partner.userID);
          await user
            .send(
              `Your partner app at paradise bot list has been denied by: <@${req.user.id}>(${req.user.username}), Please contact this Staff Member for more info`,
            )
            .catch(() => {});
          await user_partner.deleteOne();
          partners = await partner_app.find({}, { _id: false, auth: false });
          partners.filter((app) => app);
          return renderTemplate(res, req, 'panel/admin.ejs', {
            webAdmin: webAdmin,
            reportbug: bugres,
            bots: penbotlist,
            alert: alertmsg,
            error: errormsg,
            partners: partners,
            staff_apps: staff_apps,
          });
        }
      }
      if (req.body.accept_staff) {
        let new_staff = await staff_app.findOne({
          userID: req.body.accept_staff,
        });

        if (!new_staff) {
          errormsg = `Error occured while accepting the new staff !`;
          await new_staff.deleteOne();
          staff_apps = await staff_app.find({}, { _id: false, auth: false });
          staff_apps.filter((app) => app);
          renderTemplate(res, req, 'panel.ejs', {
            webAdmin: webAdmin,
            reportbug: bugres,
            bots: penbotlist,
            alert: alertmsg,
            error: errormsg,
            partners: partners,
            staff_apps: staff_apps,
          });
        } else {
          alertmsg = `Successful accepted the new staff member!`;
          await client.guilds.cache
            .get(config.guildid)
            .channels.cache.get('762752184944689192')
            .send(
              `<@${new_staff.userID}> (\`${
                new_staff.username
              }\`) staff app has been approved with **${
                client.guilds.cache
                  .get(client.config.guildid)
                  .roles.cache.get(new_staff.position).name
              }** position!`,
            );
          let user = await client.users.fetch(new_staff.userID);
          await user
            .send('Your staff app at paradise bot list has been approved')
            .catch(() => {});
          let member = client.guilds.cache
            .get(config.guildid)
            .members.cache.get(new_staff.userID);
          let role = client.guilds.cache
            .get(config.guildid)
            .roles.cache.get(new_staff.position);
          await member.roles.add(role);
          await new_staff.deleteOne();
          staff_apps = await staff_app.find({}, { _id: false, auth: false });
          staff_apps.filter((app) => app);
          renderTemplate(res, req, 'panel/admin.ejs', {
            webAdmin: webAdmin,
            reportbug: bugres,
            bots: penbotlist,
            alert: alertmsg,
            error: errormsg,
            partners: partners,
            staff_apps: staff_apps,
          });
        }
      }
      if (req.body.deny_staff) {
        let staff = await staff_app.findOne({ userID: req.body.deny_staff });

        if (!staff) {
          errormsg = `Error occured while deny the staff app !`;
          await staff.deleteOne();
          staff_apps = await staff_app.find({}, { _id: false, auth: false });
          staff_apps.filter((app) => app);
          return renderTemplate(res, req, 'panel/admin.ejs', {
            webAdmin: webAdmin,
            reportbug: bugres,
            bots: penbotlist,
            alert: alertmsg,
            error: errormsg,
            partners: partners,
            staff_apps: staff_apps,
          });
        } else {
          alertmsg = `Successful denied the staff app!`;
          await client.guilds.cache
            .get(config.guildid)
            .channels.cache.get('762752184944689192')
            .send(
              `<@${staff.userID}> (\`${staff.username}\`) staff app has been denied! by: <@${req.user.id}>, Please contact this Staff Member for more info.`,
            );
          let user = await client.users.fetch(staff.userID);
          await user
            .send(
              `Your staff app at paradise bot list has been denied by: <@${req.user.id}>(${req.user.username}), Please contact this Staff Member for more info`,
            )
            .catch(() => {});
          await staff.deleteOne();
          staff_apps = await staff_app.find({}, { _id: false, auth: false });
          staff_apps.filter((app) => app);
          return renderTemplate(res, req, 'panel/admin.ejs', {
            webAdmin: webAdmin,
            reportbug: bugres,
            bots: penbotlist,
            alert: alertmsg,
            error: errormsg,
            partners: partners,
            staff_apps: staff_apps,
          });
        }
      }
    }
  });

  // Verification Panel
  app.get('/panel/queue', checkAuth, async (req, res, next) => {
    let webAdmin = req.user.id;

    if (!config.owners.includes(req.user.id)) {
      return res.redirect('/');
    } else {
      const penbotlist = await BOTS.find(
        { status: 'pending' },
        { _id: false, auth: false },
      ).sort([['descending']]);
      penbotlist.filter((bot) => bot);
      for (i = 0; i < penbotlist.length; i++) {
        await client.users.fetch(penbotlist[i].botid);
      }
      renderTemplate(res, req, '/panel/queue.ejs', {
        webAdmin: webAdmin,
        bots: penbotlist,
        alert: null,
        error: null,
      });
    }
  });

  app.post('/panel/queue', checkAuth, async (req, res, next) => {
    const webAdmin = req.user.id;

    let penbotlist = await BOTS.find(
      { status: 'pending' },
      { _id: false, auth: false },
    ).sort([['descending']]);
    penbotlist.filter((bot) => bot);
    for (i = 0; i < penbotlist.length; i++) {
      await client.users.fetch(penbotlist[i].botid);
    }
    if (req.body.checkingdelete) {
      BOTS.findOne({ botid: req.body.clientid }, async (err, bot3) => {
        if (!bot3) {
          return renderTemplate(res, req, '/panel/queue.ejs', {
            webAdmin: webAdmin,
            bots: penbotlist,
            alert: null,
            error: 'That bot does not exist in our database',
          });
        } else {
          client.guilds.cache
            .get(config.guildid)
            .channels.cache.get(config.botlogs)
            .send(
              `<@${req.body.clientid}> has been deleted by <@${req.user.id}> (<@${bot3.owner}>)\nReason: **${req.body.deletereason}**`,
            );
          let thebot2 = client.guilds.cache
            .get(config.guildid)
            .members.cache.get(req.body.clientid);
          thebot2.kick().catch(() => {});
          BOTS.find(
            {
              owner: bot3.owner,
              status: 'approved',
            },
            (err, bot4) => {
              if (bot4.length <= 1) {
                let theowner = client.guilds.cache
                  .get(config.guildid)
                  .members.cache.get(bot3.owner);
                let role3 = client.guilds.cache
                  .get(config.guildid)
                  .roles.cache.get(config.verifieddevs);
                theowner.roles.remove(role3);
              }
            },
          );
          bot3.status = 'denied';
          bot3.date = Date.now();
          await bot3.save();
          penbotlist = await BOTS.find(
            { status: 'pending' },
            { _id: false, auth: false },
          ).sort([['descending']]);
          penbotlist.filter((bot) => bot);
          for (i = 0; i < penbotlist.length; i++) {
            await client.users.fetch(penbotlist[i].botid);
          }
          return renderTemplate(res, req, '/panel/queue.ejs', {
            webAdmin: webAdmin,
            bots: penbotlist,
            alert: 'Successfully the bot has been deleted!',
            error: null,
          });
        }
      });
    }
    if (req.body.reject_bot) {
      if (
        !client.guilds.cache
          .get(config.guildid)
          .members.cache.get(req.body.reject_bot)
      ) {
        return renderTemplate(res, req, '/panel/queue.ejs', {
          webAdmin: webAdmin,
          bots: penbotlist,
          alert: null,
          error: 'Bot is not at server!',
        });
      }
      BOTS.findOne({ botid: req.body.reject_bot }, async (err, bot) => {
        if (!bot) {
          return renderTemplate(res, req, '/panel/queue.ejs', {
            webAdmin: webAdmin,
            bots: penbotlist,
            alert: null,
            error: 'Error occured while rejecting bot!',
          });
        } else {
          if (req.user.id == bot.owner)
            return renderTemplate(res, req, '/panel/queue.ejs', {
              webAdmin: webAdmin,
              bots: penbotlist,
              alert: null,
              error: "You can't take any actions for your own bot",
            });
          if (bot.status == 'denied')
            return renderTemplate(res, req, '/panel/queue.ejs', {
              webAdmin: webAdmin,
              bots: penbotlist,
              alert: null,
              error: 'Someone already rejected the bot faster than you!',
            });
          var deniedMsg = new MessageEmbed()
            .setTitle('Bot Denied')
            .setColor('#7289DA')
            .setDescription(
              'Whoops, A bot has been rejected, Please make sure you read our rules before you resubmit',
            )
            .addField('Bot', `<@!${bot.botid}>`)
            .addField('Mod', `<@!${req.user.id}>`)
            .addField('Owner/s', `<@${bot.owner}>`)
            .addField('Reason', `${req.body.reason}`)
            .setTimestamp();
          let theOwner = client.guilds.cache
            .get(config.guildid)
            .members.cache.get(bot.owner);
          theOwner.send(deniedMsg);
          client.guilds.cache
            .get(config.guildid)
            .channels.cache.get(config.botlogs)
            .send(deniedMsg);
          let thebot = client.guilds.cache
            .get(config.guildid)
            .members.cache.get(req.body.reject_bot);
          thebot.kick().catch(() => {});
          bot.status = 'denied';
          bot.date = Date.now();
          await bot.save();
          penbotlist = await BOTS.find(
            { status: 'pending' },
            { _id: false, auth: false },
          ).sort([['descending']]);
          penbotlist.filter((bot) => bot);
          for (i = 0; i < penbotlist.length; i++) {
            await client.users.fetch(penbotlist[i].botid);
          }
          return renderTemplate(res, req, '/panel/queue.ejs', {
            webAdmin: webAdmin,
            bots: penbotlist,
            alert: 'Success the bot has been denied!',
            error: null,
          });
        }
      });
    }
    if (req.body.accept_bot) {
      if (
        !client.guilds.cache
          .get(config.guildid)
          .members.cache.get(req.body.accept_bot)
      ) {
        return renderTemplate(res, req, '/panel/queue.ejs', {
          webAdmin: webAdmin,
          bots: penbotlist,
          alert: null,
          error: 'Bot is not at server!',
        });
      }
      BOTS.findOne({ botid: req.body.accept_bot }, async (err, bot) => {
        if (!bot) {
          return renderTemplate(res, req, '/panel/queue.ejs', {
            webAdmin: webAdmin,
            bots: penbotlist,
            alert: null,
            error: 'Error occured while rejecting bot, Is it in our Database?!',
          });
        } else {
          if (req.user.id == bot.owner)
            return renderTemplate(res, req, '/panel/queue.ejs', {
              webAdmin: webAdmin,
              bots: penbotlist,
              alert: null,
              error: "You can't take any actions for your own bot",
            });
          let theBotUsername = await client.guilds.cache
            .get(config.guildid)
            .members.cache.get(bot.botid).username;

          if (
            !client.guilds.cache
              .get(config.guildid)
              .members.cache.get(bot.owner)
          ) {
            var autoDeny = new MessageEmbed()
              .setTitle('Bot Removed Automatically')
              .setColor('#7289DA')
              .setDescription(
                'Whoops, Looks like the owner left the server, The bot will now be removed from our list',
              )
              .addField('Bot', `<@!${bot.botid}>`)
              .addField('Mod', `<@!${req.user.id}>`)
              .addField('Owner/s', `<@${bot.owner}>`)
              .addField('Reason', 'Bot owner is no longer in our server.')
              .setTimestamp();

            let theOwner = client.guilds.cache
              .get(config.guildid)
              .members.cache.get(bot.owner);

            client.guilds.cache
              .get(config.guildid)
              .channels.cache.get(config.botlogs)
              .send(autoDeny)
              .catch(() => {});

            let thebot = client.guilds.cache
              .get(config.guildid)
              .members.cache.get(req.body.accept_bot);

            let guild = client.guilds.cache.get(config.guildid);

            let kicked = guild.member(thebot);

            kicked.kick().catch(() => {});

            BOTS.findOne({ botid: req.body.accept_bot }, async (err, bot2) => {
              if (bot2) {
                bot2.status = 'denied';
                bot2.date = Date.now();
                await bot2.save();
              }
            });

            penbotlist = await BOTS.find(
              { status: 'pending' },
              { _id: false, auth: false },
            ).sort([['descending']]);

            penbotlist.filter((bot) => bot);

            return renderTemplate(res, req, '/panel/queue.ejs', {
              webAdmin: webAdmin,
              bots: penbotlist,
              alert: null,
              error: 'Bot owner is not at server!, bot got auto rejected',
            });
          }

          if (bot.status == 'approved')
            return renderTemplate(res, req, '/panel/queue.ejs', {
              webAdmin: webAdmin,
              bots: penbotlist,
              alert: null,
              error: 'Someone already approved the bot faster than you!',
            });

          var approved = new MessageEmbed()
            .setTitle('Bot Approved')
            .setColor('#7289DA')
            .setDescription('🎉🎉🎉')
            .addField('Bot', `<@!${bot.botid}>`)
            .addField('Mod', `<@!${req.user.id}>`)
            .addField('Owner/s', `<@${bot.owner}>`)
            .addField('Feedback', `${req.body.reason}`)
            .addField(
              'Bot Page',
              `[View it Here](https://paradisebots.net/bots/${bot.botid})`,
            )
            .setTimestamp();

          let theOwner = client.guilds.cache
            .get(config.guildid)
            .members.cache.get(bot.owner);

          client.guilds.cache
            .get(config.guildid)
            .channels.cache.get(config.botlogs)
            .send(approved);

          theOwner.send(approved);
          bot.status = 'approved';
          bot.date = Date.now();
          await bot.save();
          for (i = 0; i < penbotlist.length; i++) {
            await client.users.fetch(penbotlist[i].botid);
          }
          let thebot = client.guilds.cache
            .get(config.guildid)
            .members.cache.get(req.body.accept_bot);
          let theowner = client.guilds.cache
            .get(config.guildid)
            .members.cache.get(bot.owner);
          let role = client.guilds.cache
            .get(config.guildid)
            .roles.cache.get(config.verifiedbots);
          let role2 = client.guilds.cache
            .get(config.guildid)
            .roles.cache.get(config.pendingbots);
          let role3 = client.guilds.cache
            .get(config.guildid)
            .roles.cache.get(config.verifieddevs);
          thebot.roles.add(role);
          thebot.roles.remove(role2);
          theowner.roles.add(role3);
          penbotlist = await BOTS.find(
            { status: 'pending' },
            { _id: false, auth: false },
          ).sort([['descending']]);
          penbotlist.filter((bot) => bot);
          return renderTemplate(res, req, '/panel/queue.ejs', {
            webAdmin: webAdmin,
            bots: penbotlist,
            alert: 'Success the bot has been accepted!',
            error: null,
          });
        }
      });
    }
  });

  // Bug Reports Panel
  app.get('/panel/reports', checkAuth, async (req, res, next) => {
    let webAdmin = req.user.id;

    if (!config.owners.includes(req.user.id)) {
      return res.redirect('/');
    } else {
      const bugres = await ERRORS.find({}, { _id: false, auth: false });
      bugres.filter((bug) => bug);

      renderTemplate(res, req, 'panel/reports.ejs', {
        webAdmin: webAdmin,
        alert: null,
        error: null,
        reportbug: bugres,
      });
    }
  });

  app.post('/panel/reports', checkAuth, async (req, res, next) => {
    const webAdmin = req.user.id;

    let bugres = await ERRORS.find({}, { _id: false, auth: false });

    if (!config.owners.includes(req.user.id)) {
      return res.redirect('/');
    } else {
      let alertmsg = '';

      let errormsg = '';

      if (req.body.acceptbug) {
        ERRORS.findOneAndDelete(
          { userID: req.body.acceptbug },
          async (err, bug) => {
            if (!bug) {
              errormsg = `Error occured while accepting bug !`;
              bugres = await ERRORS.find({}, { _id: false, auth: false });
              bugres.filter((bug) => bug);
              return renderTemplate(res, req, 'panel/reports.ejs', {
                webAdmin: webAdmin,
                reportbug: bugres,
                alert: alertmsg,
                error: errormsg,
              });
            } else {
              alertmsg = `Bug has been marked as Fixed and Removed!`;
              bugres = await ERRORS.find({}, { _id: false, auth: false });
              bugres.filter((bug) => bug);

              client.guilds.cache
                .get(config.guildid)
                .channels.cache.get(config.botlogs)
                .send(bugEmbed2);
              client.guilds.cache
                .get(config.guildid)
                .channels.cache.get(config.reportslog)
                .send(bugEmbed2);

              let data = {
                webAdmin: webAdmin,
                reportbug: bugres,
                alert: alertmsg,
                error: errormsg,
              };

              let theActualUser = client.users.cache.get(
                req.body.acceptbug,
              ).username;

              let bugEmbed2 = new MessageEmbed()
                .setTitle('New Bug Fix Implemented')
                .setDescription(`${theActualUser} Has marked a bug as fixed.`)
                .setColor('#7289DA')
                .setFooter(
                  '© Paradise Bots | 2020',
                  'https://i.imgur.com/Df2seyl.png',
                );

              return renderTemplate(res, req, 'panel/reports.ejs', data);
            }
          },
        );
      }
    }
  });

  // Resubmit Bot Page
  app.post('/bots/:botid/resubmit', checkAuth, async (req, res, next) => {
    BOTS.findOne(
      {
        botid: req.params.botid,
        status: 'denied',
      },
      async (err, bot) => {
        if (!bot) {
          res.redirect('/error');
        } else {
          if (
            bot.owner !== req.user.id &&
            !bot.additionalOwners.includes(req.user.id)
          )
            return res.redirect('/error');

          let botlist = await BOTS.findOne(
            { botid: req.params.botid },
            { _id: false, auth: false },
          );

          if (req.body.shortdesc.length > 150) {
            return renderTemplate(res, req, 'bots/resubmit.ejs', {
              bots: botlist,
              alert: null,
              error:
                "Short Description: Short description can't be more than 150 charactars",
            });
          } else if (req.body.shortdesc.length < 10) {
            return renderTemplate(res, req, 'bots/resubmit.ejs', {
              bots: botlist,
              alert: null,
              error:
                "Short Description: Short description can't be less than 10 charactars",
            });
          } else if (req.body.shortdesc.includes('https://discord.com')) {
            return renderTemplate(res, req, 'bots/resubmit.ejs', {
              bots: botlist,
              alert: null,
              error: 'Invite Link.. in the Short Description? NO!!!',
            });
          }

          if (req.body.longdesc.length < 300) {
            return renderTemplate(res, req, 'bots/resubmit.ejs', {
              bots: botlist,
              alert: null,
              error:
                "Long Description: Long description can't be less than 300 charactars",
            });
          }

          if (req.body.prefix.length > 20) {
            return renderTemplate(res, req, 'bots/resubmit.ejs', {
              bots: botlist,
              alert: null,
              error: "Prefix: prefix can't be more than 20 charactars",
            });
          }

          if (ishtml(req.body.shortdesc)) {
            return renderTemplate(res, req, 'bots/resubmit.ejs', {
              bots: botlist,
              alert: null,
              error:
                'Short Description: HTML is not supported in the short description!',
            });
          }

          /*if (isjs(req.body.longdesc)) {
           return renderTemplate(res, req, "bots/resubmit.ejs", { bots: botlist, alert: null, error: "Long Description: JavaScript is not supported in the short description!" });

        }
        if (isjs(req.body.shortdesc)) {
           return renderTemplate(res, req, "bots/resubmit.ejs", { bots: botlist, alert: null, error: "Short Description: JavaScript is not supported in the short description!" });
        }*/

          let text = req.body.tags;
          let tags2 = '';
          if (Array.isArray(text) == true) {
            tags2 = text.join(', ');
            if (text.length > 4)
              return renderTemplate(res, req, 'bots/resubmit.ejs', {
                bots: botlist,
                alert: null,
                error: 'Tags : Max tags is 4',
              });
          } else {
            tags2 = text;
          }
          let additionalOwners = req.body.additionals.split(' ');

          if (additionalOwners.includes(bot.owner)) {
            errormsg = "Additional Owners: You don't need to add yourself!";
          }
          let fetch = await client.users.fetch(bot.botid).catch(() => {});
          bot.additionalOwners = additionalOwners || [];
          bot.prefix = req.body.prefix || 'No prefix';
          bot.library = req.body.library || 'No librarys';
          bot.tags = tags2;
          bot.vanity = fetch.username.split(' ').join('-').toLowerCase();
          bot.serverlink =
            req.body.serverinvite || 'https://discord.gg/Cqy99Pt';
          bot.website = req.body.website || 'https://paradisebots.net/';
          (bot.github = req.body.github || 'IE: https://github.com'),
            (bot.donate = req.body.donateurl || 'https://paypal.me/'),
            (bot.invite =
              req.body.botinvite ||
              `https://discord.com/oauth2/authorize?client_id=${req.body.clientid}&permissions=0&scope=bot`);
          bot.short = req.body.shortdesc || 'No short description';
          bot.long = req.body.longdesc || 'No long description';
          bot.status = 'pending';
          bot.webhook = req.body.webhook;
          bot.date = Date.now();
          bot.banner = req.body.botbanner;
          await bot.save();
          botlist = await BOTS.findOne(
            { botid: req.params.botid },
            { _id: false, auth: false },
          );
          let r = client.guilds.cache
            .get(config.guildid)
            .roles.cache.find((r) => r.id === config.staff);
          await r.setMentionable(true);
          var e2 = new MessageEmbed()
            .setTitle('Bot ReSubmitted')
            .setColor('#7289DA')
            .setDescription(`${r}`)
            .addField('Bot', `<@${req.body.clientid}>`)
            .addField('Owner/s', `<@${req.user.id}>`)
            .addField(
              'Bot Page',
              `[View it Here](https://paradisebots.net/bots/${req.body.clientid})`,
            )
            .setTimestamp();
          await client.guilds.cache
            .get(config.guildid)
            .channels.cache.get(config.botlogs)
            .send(`${r}`);
          client.guilds.cache
            .get(config.guildid)
            .channels.cache.get(config.botlogs)
            .send(e2);
          r.setMentionable(false);
          await renderTemplate(res, req, 'bots/resubmit.ejs', {
            bots: botlist,
            alert: 'Success your bot is waiting at pending bots queue!',
            error: null,
          });
        }
      },
    );
  });
  app.get('/bots/:id/widget', async (req, res, next) => {
    let bot = await BOTS.findOne({ botid: req.params.id });
    if (!bot)
      bot = await BOTS.findOne({ vanity: req.params.id, is_certified: true });
    if (!bot) return res.redirect('/error');
    try {
      registerFont(
        path.join(
          __dirname,
          'public/fonts/quicksand/static/Quicksand-Bold.ttf',
        ),
        { family: 'Quicksand' },
      );
      let fetch = await client.users.fetch(bot.botid).catch(() => {});
      let owner = await client.users.fetch(bot.owner).catch(() => {});
      let bot_avatar = decodeURIComponent(
        fetch.displayAvatarURL().replace('/avatar/?avatar=', ''),
      )
        .replace('.png', '.png?size=512')
        .replace('.webp', '.png?size=512');
      let avatar = await resolveImage(bot_avatar);
      let icon = await resolveImage('https://i.imgur.com/Df2seyl.png');
      let like = await resolveImage('https://i.imgur.com/3tq9wSh.png');
      let dislike = await resolveImage('https://i.imgur.com/4jDvbOK.png');
      let image = new Canvas(400, 180)
        .setColor('#2D2D37')
        .printRoundedRectangle(0, 0, 400, 180, 10)
        .setTextAlign('left')
        .setTextFont('28px Quicksand')
        .setColor('#758ACF')
        .printRoundedRectangle(10, 120, 115, 25, 3)
        .printRoundedRectangle(130, 120, 115, 25, 3)
        .printRoundedRectangle(250, 120, 130, 25, 3)
        .printRoundedRectangle(10, 90, 80, 25, 3)
        .printRoundedRectangle(95, 90, 115, 25, 3)
        .printRoundedRectangle(215, 90, 80, 25, 3)
        .printRoundedRectangle(300, 90, 80, 25, 3)
        .setColor('#fff')
        .setTextSize(12)
        .printText('Powered By Paradise Bots', 240, 170)
        .setTextSize(15)
        .printText(
          `${bot.servers === 0 ? 'N/A' : formatNumbers(bot.servers)} Servers`,
          20,
          137,
        )
        .printText(
          `${bot.shards === 0 ? 'N/A' : formatNumbers(bot.shards)} Shards`,
          140,
          137,
        )
        .printText(bot.library, 260, 137)
        .printText(`${fetch.presence.status.toUpperCase()}`, 20, 107)
        .printText(
          `${bot.votes === 0 ? 0 : formatNumbers(bot.votes)} Votes`,
          105,
          107,
        )
        .printText(formatNumbers(bot.likes.size), 225, 107)
        .printText(formatNumbers(bot.dislikes.size), 310, 107)
        .setTextSize(23)
        .printText(
          client.users.cache.get(bot.botid)
            ? client.users.cache.get(bot.botid).username.length > 25
              ? client.users.cache.get(bot.botid).username.slice(0, 25) + '...'
              : client.users.cache.get(bot.botid).username
            : bot.username.length > 25
            ? bot.username.slice(0, 25) + '...'
            : bot.username,
          75,
          40,
        )
        .setTextSize(13)
        .printText(`Made by ${owner.tag}`, 75, 53)
        .printCircularImage(avatar, 40, 40, 30, 30, 5, true)
        .printCircularImage(icon, 382, 20, 10, 10, 0, true)
        .printCircularImage(like, 280, 104, 10, 10, 0, true)
        .printCircularImage(dislike, 365, 104, 10, 10, 0, true);
      if (bot.is_certified) {
        image.setTextFont('8px Quicksand').printText('CERTIFIED', 75, 62);
      }
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.end(await image.toBuffer(), 'binary');
    } catch (e) {
      console.error(e);
      res.redirect('/500');
    }
  });

  app.get('/bots/:botid', async (req, res, next) => {
    let bot = await BOTS.findOne({ botid: req.params.botid });
    if (!bot)
      bot = await BOTS.findOne({
        vanity: req.params.botid,
        is_certified: true,
      });
    if (!bot) return res.redirect('/error');
    if (
      (req.user && client.config.owners.includes(req.user.id)) ||
      (req.user && bot.owner === req.user.id)
    ) {
      bot = await BOTS.findOne({ botid: req.params.botid });
      if (!bot)
        bot = await BOTS.findOne({
          vanity: req.params.botid,
          is_certified: true,
        });
      if (!bot) return res.redirect('/error');
      if (req.params.id == 'none') return res.redirect('/error');
    } else {
      bot = await BOTS.findOne({ botid: req.params.botid, status: 'approved' });
      if (!bot)
        bot = await BOTS.findOne({
          vanity: req.params.botid,
          status: 'approved',
          is_certified: true,
        });
      if (!bot) return res.redirect('/error');
      if (req.params.id == 'none') return res.redirect('/error');
    }
    if (bot.is_certified && bot.vanity == 'none') {
      bot.vanity = bot.username.split(' ').join('-').toLowerCase();
      await bot.save();
      return res.redirect(`/bots/${bot.vanity}`);
    }

    // if (bot.status == "denied") return res.redirect("/error")

    let botlist = await BOTS.findOne(
      { botid: req.params.botid },
      { _id: false, auth: false },
    );
    botlist = bot;
    var desc = ``;

    let isUrl = url2(bot.long.replace('\n', '').replace(' ', ''));
    if (isUrl) {
      desc = `<iframe src="${bot.long
        .replace('\n', '')
        .replace(
          ' ',
          '',
        )}" width="600" height="400" style="width: 100%; height: 100vh; color: black;"><object data="${bot.long
        .replace('\n', '')
        .replace(
          ' ',
          '',
        )}" width="600" height="400" style="width: 100%; height: 100vh; color: black;"><embed src="${bot.long
        .replace('\n', '')
        .replace(
          ' ',
          '',
        )}" width="600" height="400" style="width: 100%; height: 100vh; color: black;"> </embed>${bot.long
        .replace('\n', '')
        .replace(' ', '')}</object></iframe>`;
    } else if (bot.long) desc = converter.makeHtml(bot.long);
    else desc = bot.long;

    await client.users.fetch(botlist.botid);

    await client.users.fetch(botlist.owner);

    let additionalOwnersArray = [];
    try {
      botlist.additionalOwners.forEach((i) => {
        if (!client.users.cache.get(i)) return;
        additionalOwnersArray.push(client.users.cache.get(i));
      });
    } catch (e) {
      console.log(e);
    }
    console.log(additionalOwnersArray);

    let certifiedBot = await BOTS.findOne(
      { botid: botlist.botid },
      { certifiedBot: 'certified' },
      { _id: false, auth: false },
    );
    let partneredBot = await BOTS.findOne(
      { botid: botlist.botid },
      { partneredBot: 'partnered' },
      { _id: false, auth: false },
    );
    if (!certifiedBot)
      certifiedBot = await BOTS.findOne(
        { vanity: req.params.botid },
        { certifiedBot: 'certified' },
        { _id: false, auth: false },
      );
    if (!partneredBot)
      partneredBot = await BOTS.findOne(
        { vanity: req.params.botid },
        { partneredBot: 'partnered' },
        { _id: false, auth: false },
      );
    let data = {
      isPartneredBot: partneredBot.partneredBot === 'partnered' ? true : false,
      isCertifiedBot: certifiedBot.certifiedBot === 'certified' ? true : false,
      desc: desc,
      isURL: isUrl,
      bots: botlist,
      owners: additionalOwnersArray || [],
      alert: null,
      error: null,
      token: null,
    };
    renderTemplate(res, req, 'bots/botpage.ejs', data);
  });

  app.post('/bots/:botid', checkAuth, async (req, res, next) => {
    let theBot = await BOTS.findOne(
      { botid: req.params.botid },
      { _id: false, auth: false },
    );
    let certifiedBot = await BOTS.findOne(
      { botid: req.params.botid },
      { certifiedBot: 'certified' },
      { _id: false, auth: false },
    );
    let partneredBot = await BOTS.findOne(
      { botid: req.params.botid },
      { partneredBot: 'partnered' },
      { _id: false, auth: false },
    );

    let botlist = await BOTS.findOne(
      { botid: req.params.botid },
      { _id: false, auth: false },
    );
    let bot = await BOTS.findOne({ botid: req.params.botid });
    if (!bot)
      bot = await BOTS.findOne({
        vanity: req.params.botid,
        is_certified: true,
      });
    if (!bot) return res.redirect('/error');
    botlist = bot;
    theBot = bot;
    const botOwner = await client.users.fetch(theBot.owner);
    // if (bot.status == "denied") return res.redirect("/error")
    if (!certifiedBot)
      certifiedBot = await BOTS.findOne(
        { vanity: req.params.botid },
        { certifiedBot: 'certified', is_certified: true },
        { _id: false, auth: false },
      );
    if (!partneredBot)
      partneredBot = await BOTS.findOne(
        { vanity: req.params.botid },
        { partneredBot: 'partnered' },
        { _id: false, auth: false },
      );
    var desc = ``;
    let isUrl = url2(bot.long.replace('\n', '').replace(' ', ''));

    let additionalOwnersArray = [];
    try {
      botlist.additionalOwners.forEach((i) => {
        if (!client.users.cache.get(i)) return;
        additionalOwnersArray.push(client.users.cache.get(i));
      });
    } catch (e) {
      console.log(e);
    }
    console.log(additionalOwnersArray);

    if (isUrl) {
      desc = `<iframe src="${bot.long
        .replace('\n', '')
        .replace(
          ' ',
          '',
        )}" width="600" height="400" style="width: 100%; height: 100vh; color: black;"><object data="${bot.long
        .replace('\n', '')
        .replace(
          ' ',
          '',
        )}" width="600" height="400" style="width: 100%; height: 100vh; color: black;"><embed src="${bot.long
        .replace('\n', '')
        .replace(
          ' ',
          '',
        )}" width="600" height="400" style="width: 100%; height: 100vh; color: black;"> </embed>${bot.long
        .replace('\n', '')
        .replace(' ', '')}</object></iframe>`;
    } else if (bot.long) desc = converter.makeHtml(bot.long);
    else desc = bot.long;
    if (req.body.like) {
      let check = bot.likes.get(req.user.id);
      if (bot.likes.get(req.user.id)) bot.likes.delete(req.user.id);
      else bot.likes.set(req.user.id, 1);
      if (bot.dislikes.get(req.user.id)) bot.dislikes.delete(req.user.id);
      await bot.save();
      return renderTemplate(res, req, 'bots/botpage.ejs', {
        owners: additionalOwnersArray,
        isCertifiedBot:
          certifiedBot.certifiedBot === 'certified' ? true : false,
        isPartneredBot:
          partneredBot.partneredBot === 'partnered' ? true : false,
        desc: desc,
        isURL: isUrl,
        bots: botlist,
        alert: null,
        error: null,
      });
    }
    if (req.body.dislike) {
      let check = bot.dislikes.get(req.user.id);
      if (bot.dislikes.get(req.user.id)) bot.dislikes.delete(req.user.id);
      else bot.dislikes.set(req.user.id, 1);
      if (bot.likes.get(req.user.id)) bot.likes.delete(req.user.id);
      await bot.save();
      return renderTemplate(res, req, 'bots/botpage.ejs', {
        owners: additionalOwnersArray,
        isCertifiedBot:
          certifiedBot.certifiedBot === 'certified' ? true : false,
        isPartneredBot:
          partneredBot.partneredBot === 'partnered' ? true : false,
        desc: desc,
        isURL: isUrl,
        bots: botlist,
        alert: null,
        error: null,
      });
    }
    if (req.body.token) {
      if (!req.user) return res.redirect('/login');
      let data = {
        isCertifiedBot:
          certifiedBot.certifiedBot === 'certified' ? true : false,
        isPartneredBot:
          partneredBot.partneredBot === 'partnered' ? true : false,
        desc: desc,
        isURL: isUrl,
        bots: bot,
        owners: additionalOwnersArray,
        alert: `Authorization Token: ${bot.auth}`,
        error: null,
      };
      if (bot.owner !== req.user.id)
        return renderTemplate(res, req, 'bots/botpage.ejs', data);
      return renderTemplate(res, req, 'bots/botpage.ejs', {
        owners: additionalOwnersArray,
        isCertifiedBot:
          certifiedBot.certifiedBot === 'certified' ? true : false,
        isPartneredBot:
          partneredBot.partneredBot === 'partnered' ? true : false,
        desc: desc,
        isURL: isUrl,
        bots: botlist,
        alert: `Authorization Token: ${bot.auth}`,
        error: null,
      });
    }
    if (req.body.newtoken) {
      if (!req.user) return res.redirect('/login');
      if (bot.owner !== req.user.id)
        return renderTemplate(res, req, 'bots/botpage.ejs', {
          owners: additionalOwnersArray,
          certifiedBot: bot.certifiedBot,
          desc: desc,
          isURL: isUrl,
          bots: botlist,
          alert: null,
          error: null,
        });
      bot.auth =
        Math.random()
          .toString(36)
          .replace(/[^a-z]+/g, '')
          .substr(0, 15) +
        Math.ceil(Math.random() * 52520) +
        Math.random()
          .toString(36)
          .replace(/[^a-z]+/g, '')
          .substr(0, 15) +
        Math.ceil(Math.random() * 52520) +
        Math.random()
          .toString(36)
          .replace(/[^a-z]+/g, '')
          .substr(0, 15);
      await bot.save();
      botlist = await BOTS.findOne(
        { botid: req.params.botid },
        { _id: false, auth: false },
      );
      return renderTemplate(res, req, 'bots/botpage.ejs', {
        owners: additionalOwnersArray,
        isCertifiedBot:
          certifiedBot.certifiedBot === 'certified' ? true : false,
        isPartneredBot:
          partneredBot.partneredBot === 'partnered' ? true : false,
        desc: desc,
        isURL: isUrl,
        bots: bot,
        alert: `New Authorization Token: ${bot.auth}`,
        error: null,
      });
    }
    if (req.body.permdelete) {
      if (!req.user) return res.redirect('/login');
      if (bot.owner !== req.user.id)
        return renderTemplate(res, req, 'bots/botpage.ejs', {
          owners: additionalOwnersArray,
          isCertifiedBot:
            certifiedBot.certifiedBot === 'certified' ? true : false,
          isPartneredBot:
            partneredBot.partneredBot === 'partnered' ? true : false,
          desc: desc,
          isURL: isUrl,
          bots: botlist,
          alert: null,
          error: null,
        });
      await BOTS.findOne({ botid: req.params.botid }, async (err, bot2) => {
        await bot2.deleteOne();
        var e4 = new MessageEmbed()
          .setTitle('Bot Deleted')
          .setColor('#7289DA')
          .addField('Deleted Bot', `<@${req.params.botid}>`)
          .addField('Deleted By', `<@${bot2.owner}>`)
          .addField('Reason', 'Owner requested removal')
          .setTimestamp();
        client.guilds.cache
          .get(config.guildid)
          .channels.cache.get(config.botlogs)
          .send(e4);
        if (
          client.guilds.cache
            .get(config.guildid)
            .members.cache.get(req.params.botid)
        ) {
          let thebot = client.guilds.cache
            .get(config.guildid)
            .members.cache.get(req.params.botid);
          thebot.kick().catch(() => {});
        }
        BOTS.find(
          {
            owner: bot.owner,
            status: 'approved',
          },
          (err, bot3) => {
            if (bot3.length <= 1) {
              let theowner = client.guilds.cache
                .get(config.guildid)
                .members.cache.get(bot.owner);
              let role3 = client.guilds.cache
                .get(config.guildid)
                .roles.cache.get(config.verifieddevs);
              theowner.roles.remove(role3).catch(() => {});
            }
          },
        );
        const botlist = await BOTS.find({ status: 'approved' }).sort([
          ['votes', 'descending'],
        ]);
        botlist.filter((bot) => bot);
        const botlist2 = await BOTS.find({ status: 'approved' }).sort([
          ['date', 'descending'],
        ]);
        botlist2.filter((bot) => bot);
        for (i = 0; i < botlist.length; i++) {
          await client.users.fetch(botlist[i].botid);
        }
        for (i = 0; i < botlist2.length; i++) {
          await client.users.fetch(botlist2[i].botid);
        }

        return renderTemplate(res, req, 'index.ejs', {
          bots2: botlist2,
          bots: botlist,
          alert: 'Your bot has been deleted.',
          error: null,
        });
      });
    }
  });
  app.get('/bots/:botid/report', checkAuth, async (req, res, next) => {
    let theBot = await BOTS.findOne({
      botid: req.params.botid,
      status: 'approved',
    });
    if (!theBot)
      theBot = await BOTS.findOne({
        vanity: req.params.botid,
        status: 'approved',
        is_certified: true,
      });
    if (!theBot) return res.redirect('/error');
    if (theBot.is_certified && theBot.vanity == 'none') {
      theBot.vanity = theBot.username.split(' ').join('-').toLowerCase();
      await theBot.save();
      return res.redirect(`/bots/${theBot.vanity}/report`);
    }
    const fetch = await client.users.fetch(theBot.botid).catch(() => {});
    renderTemplate(res, req, 'reports/reportbot.ejs', {
      bots: fetch,
      alert: null,
      error: null,
    });
  });
  app.post('/bots/:botid/report', checkAuth, async (req, res, next) => {
    let theBot = await BOTS.findOne({
      botid: req.params.botid,
      status: 'approved',
    });
    if (!theBot)
      theBot = await BOTS.findOne({
        vanity: req.params.botid,
        status: 'approved',
        is_certified: true,
      });
    if (!theBot) return res.redirect('/error');
    if (theBot.is_certified && theBot.vanity == 'none') {
      theBot.vanity = theBot.username.split(' ').join('-').toLowerCase();
      await theBot.save();
      return res.redirect(`/bots/${theBot.vanity}/report`);
    }
    let alert;
    let error;
    let guild = client.guilds.cache.get(client.config.guildid);
    const fetch = await client.users.fetch(theBot.botid).catch(() => {});
    const owner_fetch = await client.users.fetch(theBot.owner).catch(() => {});

    if (req.body.report_bot) {
      let e = new MessageEmbed()
        .setAuthor(
          `${fetch.username} has been Reported by ${req.user.username}`,
          fetch.displayAvatarURL(),
        )
        .setColor('#7289DA')
        .addField(
          'Bot',
          `<@${fetch.id}> (\`${fetch.username}\`), ID: (\`${fetch.id}\`)`,
        )
        .addField(
          'Bot Owner',
          `<@${owner_fetch.id}> (\`${owner_fetch.username}\`), ID: (\`${owner_fetch.id}\`)`,
        )
        .addField(
          'Reporter',
          `<@${req.user.id}> (\`${req.user.username}\`), ID: (\`${req.user.id}\`)`,
        )
        .addField('Report Reason', req.body.report_desc)
        .setTimestamp();
      guild.channels.cache
        .get(client.config.bot_reportslog)
        .send(e)
        .then((msg) => {
          msg.react('✅');
          msg.react('❌');
        });
      alert = 'Your report has been sent!';
    }
    renderTemplate(res, req, 'reports/reportbot.ejs', {
      bots: fetch,
      alert,
      error,
    });
  });
  app.get('/bots/:botid/vote', checkAuth, async (req, res, next) => {
    let theBot = await BOTS.findOne({
      botid: req.params.botid,
      status: 'approved',
    });
    if (!theBot)
      theBot = await BOTS.findOne({
        vanity: req.params.botid,
        status: 'approved',
        is_certified: true,
      });
    if (!theBot) return res.redirect('/error');
    if (theBot.is_certified && theBot.vanity == 'none') {
      theBot.vanity = theBot.username.split(' ').join('-').toLowerCase();
      await theBot.save();
      return res.redirect(`/bots/${theBot.vanity}/vote`);
    }
    const fetch = await client.users.fetch(theBot.botid).catch(() => {});
    renderTemplate(res, req, 'bots/vote.ejs', {
      bots: fetch,
      alert: null,
      error: null,
    });
  });
  app.post('/bots/:botid/vote', checkAuth, async (req, res, next) => {
    let theBot = await BOTS.findOne({
      botid: req.params.botid,
      status: 'approved',
    });
    if (!theBot)
      theBot = await BOTS.findOne({
        vanity: req.params.botid,
        status: 'approved',
        is_certified: true,
      });
    if (!theBot) return res.redirect('/error');
    const fetch = await client.users.fetch(theBot.botid).catch(() => {});

    let botUsername = client.users.cache.get(theBot.botid).username;

    let botAvatar = client.users.cache.get(theBot.botid).displayAvatarURL();

    if (req.body.vote) {
      const theAbuser = await VOTES.findOne({ user: req.user.id });
      let check22 = await VOTES.findOne({
        user: req.user.id,
        clientid: theBot.botid,
      });
      if (theAbuser && theAbuser.voteBanned === 'banned') {
        let data = {
          bots: fetch,
          alert: null,
          error:
            'You have been banned from Voting due to abuse of our API, Contact Us now: https://paradisebots.net/join',
        };
        return renderTemplate(res, req, 'bots/vote.ejs', data);
      } else if (theBot.voteBanned === 'banned') {
        let data = {
          bots: fetch,
          alert: null,
          error:
            "This bot has been flagged for recieving votes to quickly, If you're the bots owner please ontact Us now: appeals@paradisebots.net",
        };
        return renderTemplate(res, req, 'bots/vote.ejs', data);
      }
      if (!check22) {
        await new VOTES({
          user: req.user.id,
          clientid: theBot.botid,
          isPartneredBot: false,
          isCertifiedBot: false,
          date: Date.now(),
        }).save();
        theBot.votes = theBot.votes - +-1;
        await theBot.save();

        var e3 = new MessageEmbed()
          .setTitle('Vote Count Updated! 🎉')
          .setColor('#7289DA')
          .addField('Bot', `${botUsername}`)
          .addField('Voter', `${req.user.username}`)
          .addField('Vote Count', `${theBot.votes} Votes`)
          .addField(
            'Bot Page',
            `[View it Here](https://paradisebots.net/bots/${req.params.botid})`,
          )
          .setThumbnail(botAvatar)
          .setTimestamp();

        client.guilds.cache
          .get(config.guildid)
          .channels.cache.get(config.votelogs)
          .send(e3);

        let data = {
          bots: fetch,
          alert: 'Your vote has been recorded!',
          error: null,
        };
        let botavatar = client.users.cache.get(theBot.botid).displayAvatarURL();
        let botname2 = client.users.cache.get(theBot.botid).username;
        if (is_url(theBot.webhook)) {
          let webhook = new URL(theBot.webhook).pathname.toString().split('/');
          let webhookClient;
          if (webhook[3] && webhook[4])
            webhookClient = new WebhookClient(
              webhook[3].toString(),
              webhook[4].toString(),
            );

          let hookEmbed = new MessageEmbed()
            .setTitle('Vote Count Updated')
            .setColor('#7289DA')
            .setDescription(`${req.user.username} has voted for ${botname2}`)
            .addField('User ID', `${req.user.id}`)
            .addField('Vote Count', `${theBot.votes} Votes`)
            .setThumbnail(botavatar)
            .setTimestamp();

          if (webhookClient) {
            webhookClient
              .send({
                username: 'Paradise Bot List',
                avatarURL: 'https://i.imgur.com/Df2seyl.png',
                embeds: [hookEmbed],
              })
              .catch(() => {});
          }
        }
        return renderTemplate(res, req, 'bots/vote.ejs', data);
      } else {
        if (43200000 - (Date.now() - check22.date) > 0) {
          let time = ms(43200000 - (Date.now() - check22.date));
          await client.users.fetch(theBot.botid);
          await client.users.fetch(theBot.owner);
          let data = {
            bots: fetch,
            alert: null,
            error: `Come back after ${time.hours}h ${time.minutes}m ${time.seconds}s for next vote!`,
          };
          return renderTemplate(res, req, 'bots/vote.ejs', data);
        } else {
          check22.date = Date.now();
          check22.save();
          theBot.votes = theBot.votes - +-1;
          await theBot.save();

          var e3 = new MessageEmbed()
            .setTitle('Vote Count Updated! 🎉')
            .setColor('#7289DA')
            .addField('Bot', `${botUsername}`)
            .addField('Voter', `${req.user.username}`)
            .addField('Vote Count', `${theBot.votes} Votes`)
            .addField(
              'Bot Page',
              `[View it Here](https://paradisebots.net/bots/${req.params.botid})`,
            )
            .setThumbnail(botAvatar)
            .setTimestamp();

          client.guilds.cache
            .get(config.guildid)
            .channels.cache.get(config.votelogs)
            .send(e3);

          let data = {
            bots: fetch,
            alert: 'Your vote has been recorded!',
            error: null,
          };
          let botavatar = client.users.cache
            .get(theBot.botid)
            .displayAvatarURL();
          let botname2 = client.users.cache.get(theBot.botid).username;
          if (is_url(theBot.webhook)) {
            let webhook = new URL(theBot.webhook).pathname
              .toString()
              .split('/');
            let webhookClient;
            if (webhook[3] && webhook[4])
              webhookClient = new WebhookClient(
                webhook[3].toString(),
                webhook[4].toString(),
              );
            let hookEmbed = new MessageEmbed()
              .setTitle('Vote Count Updated')
              .setColor('#7289DA')
              .setDescription(`${req.user.username} has voted for ${botname2}`)
              .addField('User ID', `${req.user.id}`)
              .addField('Vote Count', `${theBot.votes} Votes`)
              .setThumbnail(botavatar)
              .setTimestamp();

            if (webhookClient) {
              webhookClient
                .send({
                  username: 'Paradise Bot List',
                  avatarURL: 'https://i.imgur.com/Df2seyl.png',
                  embeds: [hookEmbed],
                })
                .catch(() => {});
            }
          }
          return renderTemplate(res, req, 'bots/vote.ejs', data);
        }
      }
    }
    renderTemplate(res, req, 'bots/vote.ejs', {
      bots: fetch,
      alert: null,
      error: null,
    });
  });

  app.get('/bots/:botid/edit', checkAuth, async (req, res, next) => {
    BOTS.findOne({ botid: req.params.botid }, async (err, bot) => {
      let isUrl = url2(bot.long.replace('\n', '').replace(' ', ''));

      if (!bot) {
        return res.redirect('/error');
      } else {
        if (bot.status == 'denied') return res.redirect('/error');

        if (
          bot.owner !== req.user.id &&
          !bot.additionalOwners.includes(req.user.id)
        )
          return res.redirect('/');

        let botlist = await BOTS.findOne(
          { botid: req.params.botid },
          { _id: false, auth: false },
        );
        botlist = await BOTS.findOne(
          { botid: req.params.botid },
          { _id: false, auth: false },
        );

        renderTemplate(res, req, 'bots/editbot.ejs', {
          isURL: isUrl,
          bots: botlist,
          alert: null,
          error: null,
        });
      }
    });
  });

  app.post('/bots/:botid/edit', checkAuth, async (req, res, next) => {
    BOTS.findOne({ botid: req.params.botid }, async (err, bot) => {
      let isUrl = url2(req.body.longdesc.replace('\n', '').replace(' ', ''));

      if (!bot) {
        res.redirect('/error');
      } else {
        if (
          bot.owner !== req.user.id &&
          !bot.additionalOwners.includes(req.user.id)
        )
          return res.redirect('/');

        let botlist = await BOTS.findOne(
          { botid: req.params.botid },
          { _id: false, auth: false },
        );

        if (req.body.shortdesc.length > 150) {
          let isUrl = url2(
            req.body.longdesc.replace('\n', '').replace(' ', ''),
          );
          return renderTemplate(res, req, 'bots/editbot.ejs', {
            isURL: isUrl,
            bots: botlist,
            alert: null,
            error:
              "Short Description: Short description can't be more than 150 charactars",
          });
        } else if (req.body.shortdesc.length < 10) {
          let isUrl = url2(
            req.body.longdesc.replace('\n', '').replace(' ', ''),
          );
          return renderTemplate(res, req, 'bots/editbot.ejs', {
            isURL: isUrl,
            bots: botlist,
            alert: null,
            error:
              "Short Description: Short description can't be less than 10 charactars",
          });
        } else if (req.body.shortdesc.includes('https://discord.com')) {
          let isUrl = url2(
            req.body.longdesc.replace('\n', '').replace(' ', ''),
          );
          return renderTemplate(res, req, 'bots/editbot.ejs', {
            isURL: isUrl,
            bots: botlist,
            alert: null,
            error: 'Invite Link.. in the Short Description? NO!!!',
          });
        }

        if (req.body.longdesc.length < 300) {
          let isUrl = url2(
            req.body.longdesc.replace('\n', '').replace(' ', ''),
          );
          return renderTemplate(res, req, 'bots/editbot.ejs', {
            isURL: isUrl,
            bots: botlist,
            alert: null,
            error:
              "Long Description: Long description can't be less than 300 charactars",
          });
        }

        if (req.body.prefix.length > 20) {
          let isUrl = url2(
            req.body.longdesc.replace('\n', '').replace(' ', ''),
          );
          return renderTemplate(res, req, 'bots/editbot.ejs', {
            isURL: isUrl,
            bots: botlist,
            alert: null,
            error: "Prefix: prefix can't be more than 20 charactars",
          });
        }

        if (ishtml(req.body.shortdesc)) {
          let isUrl = url2(
            req.body.longdesc.replace('\n', '').replace(' ', ''),
          );
          return renderTemplate(res, req, 'bots/editbot.ejs', {
            isURL: isUrl,
            bots: botlist,
            alert: null,
            error:
              'Short Description: HTML is not supported at short description!',
          });
        }

        /*if (isjs(req.body.longdesc)) {
          return renderTemplate(res, req, "bots/editbot.ejs", { isURL: isUrl, bots: botlist, alert: null, error: "Long Description: JavaScript is not supported in the long description!" });
        }

        if (isjs(req.body.shortdesc)) {
          return renderTemplate(res, req, "bots/editbot.ejs", { isURL: isUrl, bots: botlist, alert: null, error: "Short Description: JavaScript is not supported in the short description!" });
        }*/

        let avatar =
          'https://maxcdn.icons8.com/Share/icon/Logos/discord_logo1600.png';

        if (botlist.avatar) {
          avatar = `https://cdn.discordapp.com/avatars/${botlist.botid}/${botlist.avatar}.png?size=256`;
        }

        let text = req.body.tags;
        let tags2 = '';

        if (Array.isArray(text) == true) {
          tags2 = text.join(', ');

          let isUrl = url2(
            req.body.longdesc.replace('\n', '').replace(' ', ''),
          );

          if (text.length > 4)
            return renderTemplate(res, req, 'bots/editbot.ejs', {
              isURL: isUrl,
              bots: botlist,
              alert: null,
              error: 'Tags : Max tags is 4',
            });
        } else {
          tags2 = text;
        }

        let additionalOwners;

        if (req.body.additionals) {
          additionalOwners = req.body.additionals.split(' ');

          if (additionalOwners.includes(botlist.owner)) {
            let isUrl = url2(
              req.body.longdesc.replace('\n', '').replace(' ', ''),
            );
            return renderTemplate(res, req, 'bots/editbot.ejs', {
              isURL: isUrl,
              bots: botlist,
              alert: null,
              error: "Additional Owners: You don't need to add yourself!",
            });
          }

          let guild = client.guilds.cache.get(config.guildid);

          for (i of additionalOwners) {
            if (!guild.members.cache.get(i)) {
              let isUrl = url2(
                req.body.longdesc.replace('\n', '').replace(' ', ''),
              );
              return renderTemplate(res, req, 'bots/editbot.ejs', {
                isURL: isUrl,
                bots: botlist,
                alert: null,
                error:
                  'The additional owners are not in our sever, ask them to join and try again!',
              });
            }
          }
        }

        let fetch = await client.users.fetch(bot.botid).catch(() => {});
        bot.vanity = fetch.username.split(' ').join('-').toLowerCase();
        bot.additionalOwners = additionalOwners || [];
        bot.prefix = req.body.prefix || 'No prefix';
        bot.library = req.body.library || 'No librarys';
        bot.tags = tags2;
        bot.serverlink = req.body.serverinvite || 'https://discord.gg/Cqy99Pt';
        bot.website = req.body.website || 'https://paradisebots.net/';
        (bot.github = req.body.github || 'IE: https://github.com'),
          (bot.donate = req.body.donateurl || 'https://paypal.me/'),
          (bot.invite =
            req.body.botinvite ||
            `https://discord.com/oauth2/authorize?client_id=${req.body.clientid}&permissions=0&scope=bot`);
        bot.short = req.body.shortdesc || 'No short description';
        bot.long = req.body.longdesc || 'No long description';
        bot.webhook = req.body.webhook;
        bot.banner = req.body.botbanner || '';
        await bot.save();

        botlist = await BOTS.findOne(
          { botid: req.params.botid },
          { _id: false, auth: false },
        );
        let isUrl = url2(bot.long.replace('\n', '').replace(' ', ''));
        let r = client.guilds.cache
          .get(config.guildid)
          .roles.cache.find((r) => r.id === config.staff);
        await r.setMentionable(true);
        var e4 = new MessageEmbed()
          .setTitle('Bot Updated')
          .setColor('#7289DA')
          .addField('Bot', `<@!${req.body.clientid}>`)
          .addField('Updated By', `<@!${req.user.id}>`)
          .addField(
            'Bot Page',
            `[View it Here](https://paradisebots.net/bots/${req.body.clientid})`,
          )
          .setTimestamp();
        client.guilds.cache
          .get(config.guildid)
          .channels.cache.get(config.botlogs)
          .send(e4);
        r.setMentionable(false);
        await renderTemplate(res, req, 'bots/editbot.ejs', {
          isURL: isUrl,
          bots: botlist,
          alert: 'Success your bot has been updated!',
          error: null,
        });
      }
    });
  });

  app.get('/bots', async (req, res, next) => {
    const certifiedBot = await BOTS.find(
      { status: 'approved' },
      { certifiedBot: 'certified' },
      { _id: false, auth: false },
    );
    const botlist = await BOTS.find(
      { status: 'approved' },
      { _id: false, auth: false },
    ).sort([['votes', 'descending']]);
    botlist.filter((bot) => bot);
    for (i = 0; i < botlist.length; i++) {
      await client.users.fetch(botlist[i].botid);
    }
    renderTemplate(res, req, 'bots/bots.ejs', {
      isCertifiedBot: certifiedBot.certifiedBot === 'certified' ? true : false,
      bots: botlist,
      alert: null,
      error: null,
    });
  });
  app.post('/bots', async (req, res) => {
    if (req.body.searchbutton) {
      return res.redirect('/search=' + req.body.search);
    }
    const certifiedBot = await BOTS.find(
      { status: 'approved' },
      { certifiedBot: 'certified' },
      { _id: false, auth: false },
    );
    const botlist = await BOTS.find(
      { status: 'approved' },
      { _id: false, auth: false },
    ).sort([['votes', 'descending']]);
    botlist.filter((bot) => bot);
    for (i = 0; i < botlist.length; i++) {
      await client.users.fetch(botlist[i].botid);
    }
    renderTemplate(res, req, 'bots/bots.ejs', {
      isCertifiedBot: certifiedBot.certifiedBot === 'certified' ? true : false,
      bots: botlist,
      alert: null,
      error: null,
    });
  });

  /* CERTIFIED BOTS PAGE ROUTING */
  app.get('/certified', async (req, res, next) => {
    const certifiedList = await BOTS.find(
      { status: 'approved', certifiedBot: 'certified' },
      { _id: false, auth: false },
    ).sort([['votes', 'descending']]);
    certifiedList.filter((bot) => bot);
    for (i = 0; i < certifiedList.length; i++) {
      await client.users.fetch(certifiedList[i].botid);
    }
    renderTemplate(res, req, 'bots/certified.ejs', {
      bots: certifiedList,
      alert: null,
      error: null,
    });
  });
  app.post('/certified', async (req, res, next) => {
    const certifiedList = await BOTS.find(
      { status: 'approved', certifiedBot: 'certified' },
      { _id: false, auth: false },
    ).sort([['votes', 'descending']]);
    certifiedList.filter((bot) => bot);
    for (i = 0; i < certifiedList.length; i++) {
      await client.users.fetch(certifiedList[i].botid);
    }
    renderTemplate(res, req, 'bots/certified.ejs', {
      bots: certifiedList,
      alert: null,
      error: null,
    });
  });

  /* PARTNERED BOTS PAGE ROUTING */
  app.get('/partnered', async (req, res, next) => {
    const partneredList = await BOTS.find(
      { status: 'approved', partneredBot: 'partnered' },
      { _id: false, auth: false },
    ).sort([['votes', 'descending']]);
    partneredList.filter((bot) => bot);
    for (i = 0; i < partneredList.length; i++) {
      await client.users.fetch(partneredList[i].botid);
      const isPartnered = await BOTS.find(
        { botid: partneredList[i].botid },
        { _id: false, auth: false },
      );
    }
    renderTemplate(res, req, 'bots/partnered.ejs', {
      bots: partneredList,
      alert: null,
      error: null,
    });
  });
  app.post('/partnered', async (req, res, next) => {
    const partneredList = await BOTS.find(
      { status: 'approved', partneredBot: 'partnered' },
      { _id: false, auth: false },
    ).sort([['votes', 'descending']]);
    partneredList.filter((bot) => bot);
    for (i = 0; i < partneredList.length; i++) {
      await client.users.fetch(partneredList[i].botid);
    }
    renderTemplate(res, req, 'bots/partnered.ejs', {
      bots: partneredList,
      alert: null,
      error: null,
    });
  });

  app.get('/profile', checkAuth, async (req, res, next) => {
    let users = await USERS.findOne({ userID: req.user.id });
    USERS.findOne({ userID: req.user.id }, (err, res) => {
      if (!res) {
        new USERS({
          userID: req.user.id,
          bio: 'Iam a very mysterious person!',
          website: '',
          github: '',
        }).save();
      }
    });

    //uwu whoever finds this have an amazing day!
    let userbots = await BOTS.find({ owner: req.user.id });
    let otherBots = await BOTS.find({ additionalOwners: req.user.id });

    userbots.concat(otherBots);

    for (i = 0; i < userbots.length; i++) {
      try {
        await client.users.fetch(userbots[i].botid);
      } catch (e) {
        console.log(e);
      }
    }

    renderTemplate(res, req, 'users/profile.ejs', {
      bots: userbots,
      bots2: otherBots,
      profile: users,
      alert: null,
      error: null,
    });
  });

  app.post('/profile', checkAuth, async (req, res, next) => {
    let userbots = await BOTS.find({ owner: req.user.id });
    let otherBots = await BOTS.find({ additionalOwners: req.user.id });
    userbots.concat(otherBots);
    for (i = 0; i < userbots.length; i++) {
      try {
        await client.users.fetch(userbots[i].botid);
      } catch (e) {
        console.log(e);
      }
    }
    let users = await USERS.findOne({ userID: req.user.id });
    let alertmsg = '';
    let errormsg = '';
    USERS.findOne({ userID: req.user.id }, async (err, res) => {
      if (!res) {
        await new USERS({
          userID: req.user.id,
          bio: req.body.changebio || 'Iam a very mysterious person!',
          website: req.body.changewebsite,
          github: req.body.changegithub,
        }).save();
      }
    });
    if (req.body.changebio) {
      if (req.body.changebio.length > 50) {
        errormsg = 'Max length for bio is 50 characters!';
        return renderTemplate(res, req, 'users/profile.ejs', {
          bots: userbots,
          bots2: otherBots,
          profile: users,
          alert: alertmsg,
          error: errormsg,
        });
      } else if (req.body.changebio.length < 10) {
        errormsg = "Bio can't be less than 10 characters!";
        return renderTemplate(res, req, 'users/profile.ejs', {
          bots: userbots,
          bots2: otherBots,
          profile: users,
          alert: alertmsg,
          error: errormsg,
        });
      } else {
        if (req.body.changewebsite) {
          return renderTemplate(res, req, 'users/profile.ejs', {
            bots: userbots,
            bots2: otherBots,
            profile: users,
            alert: alertmsg,
            error: errormsg,
          });
        } else {
          if (req.body.changegithub) {
            return renderTemplate(res, req, 'users/profile.ejs', {
              bots: userbots,
              bots2: otherBots,
              profile: users,
              alert: alertmsg,
              error: errormsg,
            });
          } else {
            if (users) {
              users.bio = req.body.changebio;
              users.website = req.body.changewebsite;
              users.github = req.body.changegithub;
              await users.save();
              alertmsg = 'Your profile has been updated successfully!';
              users = await USERS.findOne({ userID: req.user.id });
              return renderTemplate(res, req, 'users/profile.ejs', {
                bots: userbots,
                bots2: otherBots,
                profile: users,
                alert: alertmsg,
                error: errormsg,
              });
            } else {
              users = await USERS.findOne({ userID: req.user.id });
              for (i = 0; i < userbots.length; i++) {
                await client.users.fetch(userbots[i].botid);
              }
              alertmsg = 'Your bio has been updated successfully!';
              return renderTemplate(res, req, 'users/profile.ejs', {
                bots: userbots,
                bots2: otherBots,
                profile: users,
                alert: alertmsg,
                error: errormsg,
              });
            }
          }
        }
      }
    }

    if (req.body.captcha == 'delete') {
      if (req.body.requestdelete) {
        if (!users) {
          errormsg = "You don't have data in our site!";
          return renderTemplate(res, req, 'users/profile.ejs', {
            bots: userbots,
            bots2: otherBots,
            profile: users,
            alert: alertmsg,
            error: errormsg,
          });
        } else {
          await USERS.findOneAndDelete({ userID: req.user.id });
          await BOTS.find({ owner: req.user.id }, (err, res) => {
            res.forEach((bot) => {
              bot.deleteOne();
            });
          });
          userbots = await BOTS.find({ owner: req.user.id });
          for (i = 0; i < userbots.length; i++) {
            await client.users.fetch(userbots[i].botid);
          }
          otherBots = await BOTS.find({ additionalOwners: req.user.id });
          userbots.concat(otherBots);
          for (i = 0; i < userbots.length; i++) {
            try {
              await client.users.fetch(userbots[i].botid);
            } catch (e) {
              console.log(e);
            }
          }
          alertmsg = 'Your data has been deleted!';
          users = await USERS.findOne({ userID: req.user.id });
          return await renderTemplate(res, req, 'users/profile.ejs', {
            bots: userbots,
            bots2: otherBots,
            profile: users,
            alert: alertmsg,
            error: errormsg,
          });
        }
      }
    } else {
      errormsg = "You didn't complete captcha!";
      return renderTemplate(res, req, 'users/profile.ejs', {
        bots: userbots,
        bots2: otherBots,
        profile: users,
        alert: alertmsg,
        error: errormsg,
      });
    }

    renderTemplate(res, req, 'users/profile.ejs', {
      bots: userbots,
      bots2: otherBots,
      profile: users,
      alert: alertmsg,
      error: errormsg,
    });
  });

  // TRANSFER BOT OWNER STUFF HERE
  app.get('/bots/:botid/transfer', checkAuth, async (req, res, next) => {
    const bot = await BOTS.find({ botid: req.params.botid });

    if (!bot.owner === req.user.id) return res.redirect('/');

    renderTemplate(res, req, 'bots/transfer-bot.ejs', {
      bots: bot,
      alert: null,
      error: null,
    });
  });

  app.post('/bots/:botid/transfer', checkAuth, async (req, res, next) => {
    let userbots = await BOTS.findOne({ botid: req.params.botid });

    if (!userbots.owner === req.user.id) return res.redirect('/');

    let alertmsg = '';
    let errormsg = '';

    let newOwner = (newOwner = await USERS.findOne({
      userID: req.body.userid,
    }));

    if (req.body.checkingtransfer) {
      BOTS.findOne({ botid: req.params.botid }, async (err, bot7) => {
        if (!newOwner) {
          errormsg = 'That user does not exist in our Database';

          return renderTemplate(res, req, 'bots/transfer-bot.ejs', {
            newOwner: newOwner,
            bots: userbots,
            alert: alertmsg,
            error: errormsg,
          });
        }
        if (!bot7) {
          errormsg = 'That bot does not exist in our Database';

          return renderTemplate(res, req, 'bots/transfer-bot.ejs', {
            newOwner: newOwner,
            bots: userbots,
            alert: alertmsg,
            error: errormsg,
          });
        } else {
          client.guilds.cache
            .get(config.guildid)
            .channels.cache.get(config.botlogs)
            .send(
              `<@${req.body.clientid}> has been transferred  by <@${req.user.id}> (<@${bot7.owner}>)\nReason: **${req.body.transferreason}**`,
            );

          let thebot4 = client.guilds.cache
            .get(config.guildid)
            .members.cache.get(req.body.clientid);

          bot7.owner = newOwner.userID;

          await bot7.save();

          alertmsg = 'Successfully the bot has been transferred!';
        }
      });
    }
    return renderTemplate(res, req, 'bots/transfer-bot.ejs', {
      newOwner: newOwner,
      bots: userbots,
      alert: alertmsg,
      error: errormsg,
    });
  });

  app.get('/users/:userID', async (req, res, next) => {
    let userbots = await BOTS.find({ owner: req.params.userID });
    let otherBots = await BOTS.find({ additionalOwners: req.params.userID });
    let users = await USERS.findOne({ userID: req.params.userID });
    let member = await client.users.cache.get(req.params.userID);

    let alertmsg = '';
    let errormsg = '';
    let certUser;

    userbots.concat(otherBots);

    for (i = 0; i < userbots.length; i++) {
      try {
        await client.users.fetch(userbots[i].botid);
      } catch (e) {
        console.log(e);
      }
    }

    if (!users.certifiedUser) {
      certUser === false;
    } else {
      certUser === true;
    }

    let data = {
      bots: userbots,
      bots2: otherBots,
      profile: users,
      member: member,
      isAdmin: config.owners.includes(req.params.userID),
      isWebAdmin: config.higherStaff.includes(req.params.userID),
      isPartnered: config.partneredUsers.includes(req.params.userID),
      certUser: users.certUser,
      alert: null,
      error: null,
    };

    renderTemplate(res, req, 'users/user.ejs', data);
  });

  app.post('/convert', async (req, res) => {
    if (req.body.markdown) {
      let html_content = converter.makeHtml(req.body.content);
      return res.json({ content: html_content });
    }
  });

  app.use(function (req, res, next) {
    res.status(404).redirect('/error');
  });

  app.use(function (error, req, res, next) {
    res.status(500).redirect('/500');
    console.log(error);
  });

  app.listen(config.port, null, null, () =>
    console.log(`Dashboard is ready at ${config.port}.`),
  );
};
