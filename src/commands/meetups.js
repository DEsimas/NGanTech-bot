const {bot, db} = process;

bot.on('message', async (msg) => {
  try {
    if(msg?.text?.includes('/meetups'))
      await meetups(msg)
  } catch(e) {
    console.log(e);
    bot.sendMessage(msg.chat.id, 'Во время исполнения команды произошла ошибка!');
  }
});

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
            callback_data: 'uwu'
          }]
        })
    }
  });
}