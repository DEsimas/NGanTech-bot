module.exports = async function(meetup) {
  const users = await process.db.getUsers();
  users.forEach(user => {
    if(user.userId === meetup.speakerId)
      return;
    process.bot.sendMessage(user.userId, `Встреча "${meetup.title}", назначенная на ${meetup.date.toLocaleString('ru').slice(0,-3)}, отменена`);
  });
}