const declOfNum = require('../utils/declOfNum');

const {bot, db} = process;

bot.on('message', async (msg) => {
  try {
    if(msg?.text?.includes('/stats'))
      await stats(msg)
  } catch(e) {
    console.log(e);
    bot.sendMessage(msg.chat.id, 'Во время исполнения команды произошла ошибка!');
  }
});

async function stats(msg) {
  const sales = await db.getSales(msg.from.id);
  const money = sales.reduce((pr, curr) => pr+curr.price, 0);
  if(!sales?.length) {
    bot.sendMessage(msg.chat.id, 'У вас не было сделок');
    return;
  }
  bot.sendMessage(msg.chat.id, `Всего ${sales.length} ${declOfNum(sales.length, ['сделка', 'сделки', 'сделок'])} на сумму ${money} руб.`, {
    reply_markup: {
      inline_keyboard: 
        sales.map(el => {
          return [{
            text: `${el.price} | ${el.date.toLocaleString('ru').slice(0,-3)}`,
            callback_data: 'uwu'
          }]
        })
    }
  });
}