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
    case '/deletemeetup':
      handler = deleteMeetup;
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

  const dateFormat = new RegExp(/..\...\..... ..:../); //30.06.2022 19:32
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
    speakerId: msg.from.id,
    date,
    title
  });

  bot.sendMessage(msg.chat.id, 'Встреча запланирована.');
}

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