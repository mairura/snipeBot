const { Telegraf } = require("telegraf");
require("dotenv").config({ path: ".env" });

const bot = new Telegraf(process.env.BOT_TOKEN);
// console.log("Bot:", bot);
bot.start((ctx: any) => ctx.reply("Welcome"));
bot.help((ctx: any) => ctx.reply("Send me a a sticker"));
bot.on('sticker', (ctx: any) => ctx.reply("👍"));
bot.hears("Hi", (ctx: any) => ctx.reply("Hey there"));
bot.launch();
