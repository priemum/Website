const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const getFilesSync = require('../utils/fileWalk');

class App {
  constructor(client) {
    this.express = express();
    this.express.use(cookieParser());

    this.loadRoutes();
  }

  loadtheRoutes() {
    const routesPath = path.join(__dirname, '../routes');
    const routes = getFilesSync(routesPath);

    if (!routes.length) return this;

    routes.forEach((filename) => {
      const route = require(path.join(routesPath, filename));

      const routePath =
        filename === 'index.js' ? '/' : `/${filename.slice(0, -3)}`;

      try {
        this.express.use(routePath, route);
      } catch (error) {
        console.error(`Error occured with the route "${filename}"\n\n${error}`);
      }
    });

    return this;
  }
}

module.exports = App;
