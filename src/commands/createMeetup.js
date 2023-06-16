const {bot, db} = process;
const state = new Map();

bot.on('message', async (msg) => {
  try {
    if(!state.has(msg.from.id))
      state.set(msg.from.id, {});
    if(msg.text.includes('/createmeetup'))
      await createMeetup(msg)
    else if(state.get(msg.from.id).isWaitingMeetupTitle)
      selectTitle(msg);
  } catch(e) {
    console.log(e);
    bot.sendMessage(msg.chat.id, 'Во время исполнения команды произошла ошибка!');
  }
});

bot.on('callback_query', async (query) => {
  try {
    const data = query.data.split(' ');
    const type = data[0];
    const user = state.get(query.from.id);
    await bot.answerCallbackQuery(query.id);
    switch(type) {
      case 'month':
        user.meetup.date.month = Number(data[1]);
        await selectDate(query);
        break;
      case 'day':
        user.meetup.date.day = Number(data[1]);
        await selectHour(query);
        break;
      case 'hour':
        user.meetup.date.hour = Number(data[1]);
        await selectMinute(query);
        break;
      case 'minute':
        user.meetup.date.minute = Number(data[1]);
        await bot.editMessageText('Встреча запланирована', {chat_id: user.chatId, message_id: user.messageId});
        await scheduleMeetup(query.from.id);
        break;
    }
  } catch(e) {
    console.log(e);
    bot.sendMessage(query.message.chat.id, 'Во время исполнения команды произошла ошибка!');
}
});

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
  user.meetup = { date: {}};
}

async function selectTitle(msg) {
  const user = state.get(msg.from.id);
  user.isWaitingMeetupTitle = false;
  user.meetup.title = msg.text;
  await selectMonth(msg);
}

async function selectMonth(msg) {
  const list = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь' ];
  for(let i = 0; i < list.length; i++) {
    list[i] = [list[i], i];
  }
  const index = new Date().getMonth();
  const thisYearList = list.slice(index, 12);
  const nextYearList = list.slice(0, index);
  const months = thisYearList.concat(nextYearList);
  const markup = {
      inline_keyboard: [[],[],[],[]]
  }
  for(let i = 0; i < 12; i++)
  markup.inline_keyboard[Math.floor(i/3)].push({text: months[i][0], callback_data: `month ${months[i][1]}`});
  const user = state.get(msg.from.id);
  await bot.editMessageText('Выберете месяц встречи:', {chat_id: user.chatId, message_id: user.messageId});
  await bot.editMessageReplyMarkup(markup, {chat_id: user.chatId, message_id: user.messageId});
}

async function selectDate(query) {
  const user = state.get(query.from.id);
  const amountOfDays = new Date(new Date().getFullYear(), user.meetup.date.month+1, 0).getDate();
  const markup = {
      inline_keyboard: [[],[],[],[],[],[]]
  }
  for(let i = 1; i <= amountOfDays; i++)
    markup.inline_keyboard[Math.floor((i-1)/6)].push({text: i, callback_data: `day ${i.toString()}`});
  await bot.editMessageText('Выберете день встречи:', {chat_id: user.chatId, message_id: user.messageId});
  await bot.editMessageReplyMarkup(markup, {chat_id: user.chatId, message_id: user.messageId});
}

async function selectHour(query) {
  const user = state.get(query.from.id);
  const markup = {
    inline_keyboard: [[],[],[],[],[],[]]
  }
  for(let i = 0; i <= 23; i++)
    markup.inline_keyboard[Math.floor(i/6)].push({text: i, callback_data: `hour ${i.toString()}`});
  await bot.editMessageText('Выберете время встречи:', {chat_id: user.chatId, message_id: user.messageId});
  await bot.editMessageReplyMarkup(markup, {chat_id: user.chatId, message_id: user.messageId});
}

async function selectMinute(query) {
  const user = state.get(query.from.id);
  const time = [`${user.meetup.date.hour}:00`, `${user.meetup.date.hour}:15`, `${user.meetup.date.hour}:30`, `${user.meetup.date.hour}:45`];
  const markup = {
    inline_keyboard: [[],[],[],[],[],[]]
  }
  for(let i = 0; i < time.length; i++)
    markup.inline_keyboard[Math.floor(i/4)].push({text: time[i], callback_data: `minute ${(i*15).toString()}`});
  await bot.editMessageReplyMarkup(markup, {chat_id: user.chatId, message_id: user.messageId});
}

async function scheduleMeetup(userId) {
  const user = state.get(userId);
  const date = new Date(new Date().getFullYear(), user.meetup.date.month, user.meetup.date.day, user.meetup.date.hour, user.meetup.date.minute);
  if(date < new Date())
    date.setFullYear(date.getFullYear()+1)
  await db.createMeetup({
    speakerId: userId,
    title: user.meetup.title,
    date: date
  });
  state.set(userId, {});
}