require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const DB = require('./DAO');

process.bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});
process.db = new DB(process.env.DB_URI);
const {bot, db} = process;
require('./commands/createMeetup')
// bot.on('message', msg => {
//   if(!state.has(msg.from.id)) state.set(msg.from.id, {});
//   const user = state.get(msg.from.id);
//   if(user.isWaitingMeetupTitle) {
//     user.isWaitingMeetupTitle = false;
//     user.meetup.title = msg.text;
//     user.meetup.date = {};
//     try {
//       selectMonth(msg);
//     } catch {}
//   }
// });
/**
 * @param {TelegramBot.Message} msg 
 */
async function meetups(msg) {
  const meetups = await db.getMeetups();
  if(!meetups?.length) {
    bot.sendMessage(msg.chat.id, 'В планах пока ничего нет');
    return;
  }
  bot.sendMessage(msg.chat.id, 'Расписание встреч:', {
    reply_markup: {
      inline_keyboard: 
        meetups.map(el => {
          return [{
            text: `${el.title} | ${el.date.toLocaleString('ru').slice(0,-3)}`,
            url: 'https://github.com/DEsimas'
          }]
        })
    }
  })
}

/**
 * @param {TelegramBot.Message} msg 
 */
async function deleteMeetup(msg) {
  const userRoles = await db.getUserRoles(msg.from.id);
  if(!userRoles.includes('speaker')) {
    bot.sendMessage(msg.chat.id, 'У вас недостаточно прав для использования этой команды!');
    return;
  }

  const name = msg.text.split('"')[1];
  if(!name) {
    bot.sendMessage(msg.chat.id, 'Команда была неверно использована!');
    return;
  }

  if(await db.deleteMeetup(msg.from.id, name)) {
    bot.sendMessage(msg.chat.id, 'Успешно');
  } else {
    bot.sendMessage(msg.chat.id, 'Вы не планировали встречи с таким названием');
  }
}