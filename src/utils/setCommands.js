require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const commands = [
  {
    command: 'ping',
    description: 'pongs'
  },
  {
    command: 'hello',
    description: 'hellos'
  }
];

const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});

bot.setMyCommands(commands)
  .then(() => {
    console.log('Success');
    bot.getMyCommands()
      .then(console.log)
  })
  .catch((e) => {
    console.log(`Failed to set commands\n${e}`);
  });