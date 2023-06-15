require('dotenv').config();
const { MongoClient } = require('mongodb');
const TelegramBot = require('node-telegram-bot-api');

// const mongo = new MongoClient(process.env.DB_URI);
const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});

// mongo.connect();

bot.on('message', msg => {
  if(msg.entities?.at(0)?.type !== 'bot_command') return;
  let handler;
  switch(msg.text) {
    case '/ping':
      handler = ping;
      break;
    case '/hello':
      handler = hello;
      break;
  }
  if(handler) {
    handler(msg)
      .catch((e) => {
        console.log(e);
        bot.sendMessage(msg.chat.id, 'Во время исполнения команды произошла ошибка!')
      });
  }
});

/**
 * @param {TelegramBot.Message} msg 
 */
async function ping(msg) {
  bot.sendMessage(msg.chat.id, 'pong');
}

/**
 * @param {TelegramBot.Message} msg 
 */
async function hello(msg) {
  bot.sendMessage(msg.chat.id, `Hello, ${msg.from.first_name}!`);
}

