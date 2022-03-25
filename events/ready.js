const { readdirSync } = require('fs');
const { join } = require('path');
const filePath2 = join(__dirname, '..', 'events');
const Dashboard = require('../dashboard/dashboard');
const App = require('../structures/app.js');
const eventFiles2 = readdirSync(filePath2);
const timers = require('timers');
const BOTS = require('../models/bots');

module.exports = async (client) => {
  let bots = await BOTS.find({ status: 'approved' }, { _id: false });

  let PORT;

  PORT = process.env.PORT;

  let activities = [
    {
      name: 'Paradise Bots API v1',
      options: {
        type: 'STREAMING',
        url: 'https://www.twitch.tv/monstercat',
      },
    },
    {
      name: 'https://paradisebots.net',
      options: {
        type: 'STREAMING',
        url: 'https://www.twitch.tv/monstercat',
      },
    },
    {
      name: 'in Paradise!!',
      options: {
        type: 'PLAYING',
      },
    },
    {
      name: `${bots.length} Approved Bots`,
      options: {
        type: 'WATCHING',
      },
    },
    {
      name: 'p>help',
      options: {
        type: 'PLAYING',
      },
    },
  ];
  let i = 0;

  console.log(
    `Signed in as ${client.user.username} || Loaded [${eventFiles2.length}] event(s) & [${client.commands.size}] command(s)`,
  );
  timers.setInterval(() => {
    i = i == activities.length ? 0 : i;
    client.user.setActivity(activities[i].name, activities[i].options);

    i++;
  }, 30000);

  //client.user.setPresence({
  /*     activity: {
            name: 'paradisebots.net',
            type: "STREAMING",
            url: "https://www.twitch.tv/monstercat"
        }
    });*/
  Dashboard(client);
  //await new App(client);
};
