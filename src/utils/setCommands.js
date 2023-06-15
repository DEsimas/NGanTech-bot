require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const commands = [
  {
    command: 'createmeetup',
    description: '/createmeetup "Встреча хацкеров" "30.06.2022 19:32"'
  },
  {
    command: 'deletemeetup',
    description: 'Удалить встречу из плана по названию'
  },
  {
    command: 'meetups',
    description: 'Просмотреть список предстоящих встреч'
  }
];

const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});

bot.setMyCommands(commands)
  .then(() => {
    console.log('Success');
  })
  .catch((e) => {
    console.log(`Failed to set commands\n${e}`);
  });