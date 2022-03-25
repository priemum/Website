(exports.port = process.env.PORT || 8080),
  (exports.token = process.env.token || ''),
  (exports.domain = process.env.domain || 'https://somesite.com'),
  (exports.clientSecret = process.env.clientSecret || ''),
  (exports.id = process.env.id || ''),
  (exports.owners = ['']);
exports.higherStaff = [''];
exports.partneredUsers = [''];
exports.partneredBots = [''];
exports.certifiedBots = [''];
exports.votingBanned = [''];
exports.botlogs = process.env.botlogs || '';
exports.reportslog = process.env.reportslog || '';
exports.bot_reportslog = process.env.reportslog || '';
exports.votelogs = process.env.votelogs || '';
exports.guildid = process.env.guildid || '';
exports.testingid = process.env.testingid || '';
exports.modlog = process.env.modlog || '';
exports.certifiedLogs = process.env.certifiedLogs || '';
exports.staff = process.env.staff || '';
exports.staffTrial = process.env.staffTrial || '';
exports.web_admin = process.env.webadmin || '';
exports.verifiedbots = process.env.verifiedbots || '';
exports.verifieddevs = process.env.verifieddevs || '';
exports.pendingbots = process.env.pendingbots || '';
exports.certified_devs = '';
exports.certified_bots = '';
exports.maintenance = process.env.maintenance || 'Disabled';

/** WEBSITE STUFF **/
exports.borderStats = process.env.borderStats || 'true';
exports.apiVersion = process.env.apiVersion || 'v1.0.8';
exports.botVersion = process.env.botVersion || 'v2.2.0';
exports.webVersion = process.env.webVersion || 'v2.4.0';
exports.djsVersion = process.env.djsVersion || 'v12.2.0';
exports.nodeVersion = process.env.nodeVersion || 'v12.16.3';

exports.linkedStatus = '';
