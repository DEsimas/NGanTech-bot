require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const DB = require('./DAO');

const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});
const db = new DB(process.env.DB_URI);

bot.on('message', msg => {
  if(msg.entities?.at(0)?.type !== 'bot_command') return;
  let handler;
  const command = msg.text.split(' ')?.at(0);
  switch(command) {
    case '/createmeetup':
      handler = createMeetup;
      break;
    case '/meetups':
      handler = meetups;
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
async function createMeetup(msg) {
  const userRoles = await db.getUserRoles(msg.from.id);
  if(!userRoles.includes('speaker')) {
    bot.sendMessage(msg.chat.id, 'У вас недостаточно прав для использования этой команды!');
    return;
  }

  const dateFormat = new RegExp(/..\...\..... ..:../);
  const args = msg.text.split('"');
  const title = args[1];
  const dateString = args[3];
  if(title === '' || !dateFormat.exec(dateString)) {
    bot.sendMessage(msg.chat.id, 'Команда была неверно использована!');
    return;
  }
  const dateparts = dateString.split(/[. :]/);
  const date = new Date();
  date.setDate(dateparts[0]);
  date.setMonth(dateparts[1]-1);
  date.setFullYear(dateparts[2]);
  date.setHours(dateparts[3]);
  date.setMinutes(dateparts[4]);

  db.createMeetup({
    speaker: msg.from.username,
    date,
    title
  });

  bot.sendMessage(msg.chat.id, 'Встреча запланирована.');
}

/**
 * @param {TelegramBot.Message} msg 
 */
async function meetups(msg) {
  bot.sendMessage(msg.chat.id, `Hello, ${msg.from.first_name}!`);
}

