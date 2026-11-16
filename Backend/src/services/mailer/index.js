const transporter = require('./transporter');
const { appName, appUrl } = require('./constants');
const tutorEmails = require('./tutorEmails');
const adminEmails = require('./adminEmails');
const requestEmails = require('./requestEmails');

module.exports = {
  transporter,
  appName,
  appUrl,
  ...tutorEmails,
  ...adminEmails,
  ...requestEmails,
  ...require('./userEmails'),
};