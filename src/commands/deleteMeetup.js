const {bot, db} = process;
const state = new Map();

bot.on('message', async (msg) => {
  try {
    if(!state.has(msg.from.id))
      state.set(msg.from.id, {});
    if(msg.text.includes('/deletemeetup'))
      await deleteMeetup(msg);
    else if(state.get(msg.from.id).isDeleting)
      await deleteByTitleFromMessage(msg);
  } catch(e) {
    console.log(e);
    bot.sendMessage(msg.chat.id, 'Во время исполнения команды произошла ошибка!');
  }
});

async function deleteMeetup(msg) {
  const userRoles = await db.getUserRoles(msg.from.id);
  if(!userRoles.includes('speaker')) {
    bot.sendMessage(msg.chat.id, 'У вас недостаточно прав для использования этой команды!');
    return;
  }

  const answer = await bot.sendMessage(msg.chat.id, 'Введите название встречи, которую нужно удалить:');
  const user = state.get(msg.from.id);
  user.isDeleting = true;
  user.chatId = answer.chat.id;
  user.messageId = answer.message_id;
}

async function deleteByTitleFromMessage(msg) {
  const user = state.get(msg.from.id);
  user.isDeleting = false;
  if(await db.deleteMeetup(msg.from.id, msg.text))
    await bot.editMessageText('Встреча отменена', {chat_id: user.chatId, message_id: user.messageId});
  else
    await bot.editMessageText('Вы не планировали встречи с таким названием', {chat_id: user.chatId, message_id: user.messageId});
}