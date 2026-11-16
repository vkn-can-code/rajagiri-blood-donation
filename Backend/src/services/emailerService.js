// This file acts as the main entry point.
// It imports everything from the 'mailer' folder and re-exports it.
// This keeps your controller imports clean (e.g. require('../services/emailerService'))

const mailer = require('./mailer'); 

module.exports = mailer;