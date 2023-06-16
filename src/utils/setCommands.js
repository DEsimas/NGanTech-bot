require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const commands = [
  {
    command: 'createmeetup',
    description: 'Запланировать встречу'
  },
  {
    command: 'deletemeetup',
    description: 'Удалить встречу из плана по названию'
  },
  {
    command: 'meetups',
    description: 'Просмотреть список предстоящих встреч'
  },
  {
    command: 'confirmsale',
    description: 'Заявить о сделанной продаже'
  },
  {
    command: 'stats',
    description: 'Посмотреть свою статистику по продажам'
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