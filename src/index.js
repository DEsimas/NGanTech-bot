require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const TelegramBot = require('node-telegram-bot-api');
const DB = require('./DAO');
process.bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});
process.db = new DB(process.env.DB_URI);
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath
  ).filter(file => file.endsWith('.js'));
commandFiles.forEach((file) => require(path.join(commandsPath, file)));