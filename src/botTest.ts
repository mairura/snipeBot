const { Telegraf } = require("telegraf");
require("dotenv").config({ path: ".env" });
import axios from "axios";

const bot = new Telegraf(process.env.BOT_TOKEN);
// console.log("Bot:", bot);
bot.start((ctx: any) => ctx.reply("Welcome"));
// bot.use((ctx: any) => ctx.reply("Tupo site")); //middleware
bot.help((ctx: any) => ctx.reply("Send me a a sticker"));
bot.on("sticker", (ctx: any) => ctx.reply("This is cool👍"));
bot.hears("Hi", (ctx: any) => ctx.reply("Hey there"));

bot.command("fortune", (ctx: any) => {
  let url = "http://yerkee.com/api/fortune";
  axios.get(url).then((res) => {
    console.log("Response:", res);
    // ctx.reply(res.data.fortune);
  });
});
bot.launch();
