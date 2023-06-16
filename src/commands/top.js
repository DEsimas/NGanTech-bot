const {bot, db} = process;

bot.on('message', async (msg) => {
  try {
    if(msg.text.includes('/top'))
      await top(msg)
  } catch(e) {
    console.log(e);
    bot.sendMessage(msg.chat.id, 'Во время исполнения команды произошла ошибка!');
  }
});

async function top(msg) {
  const top = await db.getTop();
  bot.sendMessage(msg.chat.id, 'Топ:', {
    reply_markup: {
      inline_keyboard: 
        top.map(el => {
          return [{
            text: `${el.user} | ${el.sum}`,
            callback_data: 'uwu'
          }]
        })
    }
  });
}