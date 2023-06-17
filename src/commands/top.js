const declOfNum = require('../utils/declOfNum');
const state = new Map();

const {bot, db} = process;

bot.on('message', async (msg) => {
  try {
    if(!state.has(msg.chat.id))
      state.set(msg.chat.id, {filter: true});
    if(msg?.text?.includes('/top'))
      await top(msg)
  } catch(e) {
    console.log(e);
    bot.sendMessage(msg.chat.id, 'Во время исполнения команды произошла ошибка!');
  }
});

bot.on('callback_query', async (query) => {
  try {
    const data = query.data.split(' ');
    const type = data[0];
    const chat = state.get(query.message.chat.id);
    if(type !== 'top') return;
    chat.filter = Boolean(Number(data[1]));
    const options = await getMarkup(query.message.chat.id);
    try {
      await bot.editMessageReplyMarkup(options.reply_markup, {chat_id: query.message.chat.id, message_id: query.message.message_id});
    } catch {}
  } catch(e) {
    console.log(e);
    bot.sendMessage(query.message.chat.id, 'Во время исполнения команды произошла ошибка!');
  }
});

async function top(msg) {
  const user = state.get(msg.from.id);
  const options  = await getMarkup(msg.chat.id);
  const answer = await bot.sendMessage(msg.chat.id, 'Топ:', options);
  state.set(answer.chat.id, {filter: true});
}

async function getMarkup(chatId) {
  const top = await db.getTop();
  const filter = state.get(chatId).filter;
  top.sort((a,b) => filter ? b.sum - a.sum : b.amount - a.amount);
  const options = {
    reply_markup: {
      inline_keyboard: 
        await Promise.all(top.map(async (el) => {
          const user = (await bot.getChat(el.user)) || '';
          return [{
            text: `${`${user.first_name} ${user.last_name ? user.last_name : ''}`.trim()} | ${el.sum} руб. за ${el.amount} ${declOfNum(el.amount, ['сделку', 'сделки', 'сделок'])}`,
            url: `tg://user?id=${el.user}`
          }]
        }))
    }
  };
  options.reply_markup.inline_keyboard.push([
    {text: `Прибыль ${filter ? '📝' : ''}`, callback_data: 'top 1'},
    {text: `Количество ${filter ? '' : '📝'}`, callback_data: 'top 0'}
  ]);
  return options;
}