const { config } = require('dotenv');
const TelegramBot = require('node-telegram-bot-api');

config();

const bot = new TelegramBot(process.env.TOKEN, {polling: true});

bot.on('message', msg => {
  if(msg.entities?.at(0)?.type !== 'bot_command') return;
  ping(msg);
});

/**
 * 
 * @param {TelegramBot.Message} msg 
 */
function ping(msg) {
  bot.sendMessage(msg.chat.id, 'pong');
}