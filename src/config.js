require('dotenv').config();

let app_domain = null;
switch(process.env.ENV) {
  case 'local':
    app_domain = process.env.APP_DOMAIN_LOCAL;
    break;
  case 'test':
    app_domain = process.env.APP_DOMAIN_TEST;
    break;
  case 'prod':
    app_domain = process.env.APP_DOMAIN_PROD;
    break;
}

module.exports = {
  ENV: process.env.ENV,
  APP_DOMAIN: app_domain,
}
