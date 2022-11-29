import { Telegraf } from "telegraf";
import { config } from "dotenv";
config();

const bot_token = process.env.BOT_TOKEN;
console.log("Bot Token:", bot_token);
