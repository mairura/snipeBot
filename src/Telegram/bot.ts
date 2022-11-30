import { Telegraf } from "telegraf";
import { config } from "dotenv";
import { SAIswapToken, SLIPPAGE, TG_USERS } from "../config/index";
import { getAmountOutETH, getTokenAmountToSell } from "../utils/commons";
import { swapExactTokensForETHSupportingFeeOnTransferTokens } from "../uniswap";
config();

const bot_token = process.env.BOT_TOKEN;
// console.log("Bot Token:", bot_token);
if (!bot_token) {
  console.log("Your telegram token can't be fetched");
}

const bot = new Telegraf(bot_token!);

//Notification setup
export const send_message = async (message: string) => {
  console.log("Sending message:", message);
  TG_USERS.forEach((user: string | number) => {
    bot.telegram
      .sendMessage(user, message, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      })
      .catch((error: any) => {
        console.log("Error sending message", error);
      });
  });
  console.log("Message sent");
};

const main = async () => {
  bot.start((ctx) => {
    let message = "Welcome to Ted Sniper bot ⚒ ";
    message +=
      "\nYou will be receiving a new message when there is a new transaction";
    message += "\nYou can use the following commands to sell:";
    message += "\n*******Sell*******";
    message += "\ntoken address, sell percentage, gas price";
  });

  bot.help((ctx) => {
    let message = "Welcome to Brian Test Sniper Bot ⚒ ";
    message += "\nBelow is the correvt command to sell";
    message += "\n******Sell******";
    message += "token address, sell percentage, gas price";
    send_message(message);
  });

  bot.on("text", async (ctx: any) => {
    let text: any = ctx.message.text
      ? ctx.message.text
      : ctx.update.message.text || "";
    let data = text.split(",");

    data = data.map((item: string) => item.trim());

    let user = ctx.from.id.toString();

    //CHeck if user is in the TG_USERS list
    if (TG_USERS.includes(user)) {
      //Check if message length sent matches thelength expected for commands
      if (data.length === 3) {
        let message = "Processing request...";
        ctx.reply(message);

        //Process the message and get the info
        let token = data[0];
        let sell_percentage = data[1];
        let gasPrice = parseFloat(data[2]);
        let gasLimit = 1000000;
        let sell_path = [token, SAIswapToken];
        let overloads;

        overloads = {
          gasPrice: gasPrice,
          gasLimit: gasLimit,
        };

        //calculate amount to sell, using the percentage provided in the message
        let token_amount = await getTokenAmountToSell(sell_percentage, token);

        if (token_amount) {
          //Slippage
          let amountOut: any = await getAmountOutETH(token_amount, sell_path);
          let amountOutMin = amountOut * ((100 - SLIPPAGE) / 100);

          //selling "token_amount" amount of the token
          let sell_txn =
            await swapExactTokensForETHSupportingFeeOnTransferTokens(
              token_amount,
              0,
              sell_path,
              overloads
            );
          console.log("Sell Transaction:", sell_txn);

          //Send txn message to telegram after sell
          //   if (sell_txn.success === true) {
          //     let message = "******Successful Sale ********";
          //     message += "Here is your txn hash";
          //     message += `ttps://rinkeby.etherscan.io/tx/${sell_txn.data}`;
          //     await send_message(message);
          //   }
        }
      } else {
        ctx.reply("Invalid request, enter /start to get the correct format");
      }
    }
  });
  bot.launch();
};
main();
