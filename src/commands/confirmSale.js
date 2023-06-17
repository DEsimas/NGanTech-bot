const { v4 } = require('uuid');
const {bot, db} = process;
const state = new Map();
const sales = [];

bot.on('message', async (msg) => {
  try {
    if(!state.has(msg.from.id))
      state.set(msg.from.id, {});
    if(msg?.text?.includes('/confirmsale'))
      await confirmSale(msg)
    else if(state.get(msg.from.id).isWaitingMoney)
      await getMoney(msg);
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
    if(type === 'confirm') {
      if(data[1] !== 'no') {
        const sale = sales.find(el => el.id == data[1]);
        if(!sale) return;
        await db.addSale({
          userId: sale.userId,
          price: sale.price,
          date: new Date()
        });
        bot.sendMessage(sale.userId, 'Продажа подтверждена');  
      }
      await bot.deleteMessage(user.chatId, user.messageId);
    }
  } catch(e) {
    console.log(e);
    bot.sendMessage(query.message.chat.id, 'Во время исполнения команды произошла ошибка!');
  }
});

async function confirmSale(msg) {
  const user = state.get(msg.from.id);
  user.isWaitingMoney = true;
  const answer = await bot.sendMessage(msg.from.id, 'Введите сумму сделки');
  user.chatId = answer.chat.id;
  user.messageId = answer.message_id;
}

async function getMoney(msg) {
  const user = state.get(msg.from.id);
  const amount = Number(msg?.text);
  user.isWaitingMoney = false;
  if(isNaN(amount)) {
    await bot.sendMessage(msg.from.id, 'Неверное число, попробуйте ещё раз');
    return;
  }
  const sale = {userId: msg.from.id, userName: `${msg.from.first_name} ${msg.from.last_name || ''}`.trim(), price: amount, id: v4()};
  sales.push(sale);
  await verify(sale);
}

async function verify(sale) {
  const id = await db.getGodUserId();
  const msg = await bot.sendMessage(id, `${sale.userName} совершил продажу на ${sale.price} руб.?`, {
    reply_markup: {
      inline_keyboard: [[
        {text: 'Да', callback_data: `confirm ${sale.id}`},
        {text: 'Нет', callback_data: `confirm no`}
      ]]
    }
  });
  state.set(id, {
    chatId: msg.chat.id,
    messageId: msg.message_id
  })
}