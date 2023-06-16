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
  console.log(await db.getTop());
}