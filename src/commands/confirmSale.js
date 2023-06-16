const { v4 } = require('uuid');
const {bot, db} = process;
const state = new Map();

bot.on('message', async (msg) => {
  try {
    if(!state.has(msg.from.id))
      state.set(msg.from.id, {});
    if(msg.text.includes('/confirmsale'))
      await confirmSale(msg)
    else if(state.get(msg.from.id).isWaitingMoney)
      await getMoney(msg);
  } catch(e) {
    console.log(e);
    bot.sendMessage(msg.chat.id, 'Во время исполнения команды произошла ошибка!');
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
  const amount = Number(msg.text);
  if(isNaN(amount)) {
    await bot.sendMessage(msg.from.id, 'Неверное число, попробуйте ещё раз');
    return;
  }
  user.isWaitingMoney = true;
  await verify({userId: msg.from.id, userName: `${msg.from.first_name} ${msg.from.last_name || ''}`.trim(), price: amount, id: v4()});
}

async function verify(sale) {

}