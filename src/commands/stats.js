const {bot, db} = process;

bot.on('message', async (msg) => {
  try {
    if(msg.text.includes('/stats'))
      await stats(msg)
  } catch(e) {
    console.log(e);
    bot.sendMessage(msg.chat.id, 'Во время исполнения команды произошла ошибка!');
  }
});

async function stats(msg) {
  const sales = await db.getSales(msg.from.id);
  console.log(sales)
}