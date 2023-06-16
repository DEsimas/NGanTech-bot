require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const DB = require('./DAO');
process.bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});
process.db = new DB(process.env.DB_URI);
require('./commands/createMeetup');
require('./commands/meetups');
require('./commands/deleteMeetup');
