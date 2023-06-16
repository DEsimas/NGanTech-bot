const declOfNum = require('../utils/declOfNum');
const state = new Map();

const {bot, db} = process;

bot.on('message', async (msg) => {
  try {
    if(!state.has(msg.from.id))
      state.set(msg.from.id, {filter: true});
    if(msg.text.includes('/top'))
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
    const user = state.get(query.from.id);
    if(type !== 'top') return;
    user.filter = Boolean(Number(data[1]));
    const options = await getMarkup(query.from.id);
    await bot.editMessageReplyMarkup(options.reply_markup, {chat_id: user.chatId, message_id: user.messageId});
  } catch(e) {
    console.log(e);
    bot.sendMessage(query.message.chat.id, 'Во время исполнения команды произошла ошибка!');
  }
});

async function top(msg) {
  const user = state.get(msg.from.id);
  const answer = await bot.sendMessage(msg.chat.id, 'Топ:', await getMarkup(msg.from.id));
  user.chatId = answer.chat.id;
  user.messageId = answer.message_id;
}

async function getMarkup(userId) {
  const top = await db.getTop();
  const filter = state.get(userId).filter;
  top.sort((a,b) => filter ? b.sum - a.sum : b.amount - a.amount);
  const options = {
    reply_markup: {
      inline_keyboard: 
        top.map(el => {
          return [{
            text: `${el.sum} руб. за ${el.amount} ${declOfNum(el.amount, ['сделку', 'сделки', 'сделок'])}`,
            url: `tg://user?id=${el.user}`
          }]
        })
    }
  };
  options.reply_markup.inline_keyboard.push([
    {text: `Прибыль ${filter ? '📝' : ''}`, callback_data: 'top 1'},
    {text: `Количество ${filter ? '' : '📝'}`, callback_data: 'top 0'}
  ]);
  return options;
}