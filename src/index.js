require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const DB = require('./DAO');

const state = new Map();
const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});
const db = new DB(process.env.DB_URI);

bot.on('message', msg => {
  if(!state.has(msg.from.id)) state.set(msg.from.id, {});
  const user = state.get(msg.from.id);
  if(user.isWaitingMeetupTitle) {
    user.isWaitingMeetupTitle = false;
    user.meetup.title = msg.text;
    user.meetup.date = {};
    try {
      selectMonth(msg);
    } catch {}
  }

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

bot.on('callback_query', (query) => {
  const data = query.data.split(' ');
  const type = data[0];
  const user = state.get(query.from.id);
  switch(type) {
    case 'month':
      user.meetup.date.month = Number(data[1]);
      selectDate(query);
      break;
  }
  bot.answerCallbackQuery(query.id);
});

function selectMonth(msg) {
  const list = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь' ];
  const index = new Date().getMonth();
  const thisYearList = list.slice(index, 12);
  const nextYearList = list.slice(0, index);
  const months = thisYearList.concat(nextYearList);
  const markup = {
      inline_keyboard: [[],[],[],[]]
  }
  for(let i = 0; i < 12; i++)
  markup.inline_keyboard[Math.floor(i/3)].push({text: months[i], callback_data: `month ${i.toString()}`});
  const user = state.get(msg.from.id);
  bot.editMessageText('Выберете месяц встречи:', {chat_id: user.chatId, message_id: user.messageId});
  bot.editMessageReplyMarkup(markup, {chat_id: user.chatId, message_id: user.messageId});
}

function selectDate(query) {
  const user = state.get(query.from.id);
  const amountOfDays = new Date(year, user.meetup.date.month+1, 0).getDate();
  const currentDay = new Date().getDate();
  const markup = {
    reply_markup: {
      inline_keyboard: [[],[],[],[],[],[]]
    }
  }
  for(let i = 0; i < amountOfDays; i++)
    markup.reply_markup.inline_keyboard[Math.floor(i/6)].push({text: i+1, callback_data: `day ${i.toString()}`});
}

/**
 * @param {TelegramBot.Message} msg 
 */
async function createMeetup(msg) {
  const userRoles = await db.getUserRoles(msg.from.id);
  if(!userRoles.includes('speaker')) {
    bot.sendMessage(msg.chat.id, 'У вас недостаточно прав для использования этой команды!');
    return;
  }

  const answer = await bot.sendMessage(msg.from.id, 'Введите название встречи:');
  const user = state.get(msg.from.id);
  user.isWaitingMeetupTitle = true;
  user.chatId = answer.chat.id;
  user.messageId = answer.message_id;
  user.meetup = {};
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