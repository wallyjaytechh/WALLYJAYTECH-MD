//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                                                                                            //
//                                                             𝐖𝐀𝐋𝐋𝐘𝐉𝐀𝐘𝐓𝐄𝐂𝐇-𝐌𝐃 𝐁𝐎𝐓                                                                         //
//                                                                                                                                                            //
//                                                                  𝐕 : 1.0.0                                                                                 //
//                                                                                                                                                            //
//                                                                                                                                                            //
//                ██╗    ██╗ █████╗ ██╗     ██╗  ██╗   ██╗   ██╗ █████╗ ██╗   ██╗████████╗███████╗ ██████╗██╗  ██╗      ███╗   ███╗██████╗                    //
//                ██║    ██║██╔══██╗██║     ██║  ╚██╗ ██╔╝   ██║██╔══██╗╚██╗ ██╔╝╚══██╔══╝██╔════╝██╔════╝██║  ██║      ████╗ ████║██╔══██╗                   //
//                ██║ █╗ ██║███████║██║     ██║   ╚████╔╝    ██║███████║ ╚████╔╝    ██║   █████╗  ██║     ███████║█████╗██╔████╔██║██║  ██║                   //
//                ██║███╗██║██╔══██║██║     ██║    ╚██╔╝██   ██║██╔══██║  ╚██╔╝     ██║   ██╔══╝  ██║     ██╔══██║╚════╝██║╚██╔╝██║██║  ██║                   //
//                ╚███╔███╔╝██║  ██║███████╗███████╗██║ ╚█████╔╝██║  ██║   ██║      ██║   ███████╗╚██████╗██║  ██║      ██║ ╚═╝ ██║██████╔╝                   //
//                 ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚════╝ ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═╝      ╚═╝     ╚═╝╚═════╝                    //
//                                                                                                                                                            //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2025                                                                            //
//                                                                                                                                                            //
//                                                                                                                                                            //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//*
//  * @project_name : WALLYJAYTECH-MD
//  * @author : wallyjaytech
//  * @youtube : https://www.youtube.com/@wallyjaytechy
//  * @description : WALLYJAYTECH-MD ,A Multi-Device whatsapp user bot.
//*
//*
//re-upload? recode? copy code? give credit to wallyjaytech 2025:)
//Instagram: wallyjaytech
//Telegram: t.me/svenanjafrieda
//GitHub: @wallyjaytechh
//WhatsApp: +2348144317152
//want more free bot scripts? subscribe to my youtube channel: https://youtube.com/@wallyjaytechy
//   * Created By Github: wallyjaytechh.
//   * Credit To ally jay tech
//   * © 2025 WALLYJAYTECH-MD.
// ⛥┌┤
// */

//------------< SETTINGS >------------\\

const fs = require('fs');
const chalk = require('chalk');


//------------< OWNER INFO >------------\\

global.ytname = process.env.YT_NAME || "WALLY JAY TECH";

global.socialm = process.env.GITHUB_USERNAME || "GitHub: wallyjaytechh";

global.location = process.env.LOCATION || "Nigeria, Akure, Akungba";


//------------< BOT DETAILS >------------\\

global.SESSION_ID = process.env.SESSION_ID || '';

global.botname = process.env.BOT_NAME || 'WALLYJAYTECH-MD';

global.ownernumber = [process.env.OWNER_NUMBER || '2348144317152'];

global.ownername = process.env.OWNER_NAME || 'Wally Jay Tech';


//------------< SOCIAL LINKS >------------\\

global.websitex = process.env.WEBSITE_URL || "https://youtube.com/@wallyjaytechy";

global.wagc = process.env.WHATSAPP_CHANNEL || "";


//------------< OWNER COPYRIGHT >------------\\

global.themeemoji = process.env.THEME_EMOJI || '🤖';

global.wm = process.env.WATERMARK || "OWNED BY WALLY JAY TECH";

global.botscript = process.env.SCRIPT_LINK || 'https://github.com/wallyjaytechh/WALLYJAYTECH-MD';

global.packname = process.env.PACK_NAME || "WALLYJAYTECH-MD";

global.author = process.env.AUTHOR_NAME || "MADE BY WALLYJAYTECH-MD";

global.creator = process.env.CREATOR_NUMBER || "2348144317152@s.whatsapp.net";


//------------< BOT SETTINGS >------------\\

global.xprefix = process.env.PREFIX || '.';

global.premium = [process.env.PREMIUM_NUMBER || '2348144317152'];

global.typemenu = process.env.MENU_TYPE || 'v2';

global.typereply = process.env.REPLY_TYPE || 'v4';

global.autoblocknumber = process.env.AUTOBLOCK_COUNTRYCODE || '92';

global.antiforeignnumber = process.env.ANTIFOREIGN_COUNTRYCODE || '91';

global.antidelete = process.env.ANTI_DELETE === 'true';


global.listv = ['❀','○','□','♤','♡','◇','♧','々','〆','•','●','■','✿','▲','➩','➢','➣','➤','✦','✧','△'];


global.tempatDB = process.env.DB_FILE || 'database.json';


global.limit = {
  free: parseInt(process.env.FREE_LIMIT || 100),
  premium: parseInt(process.env.PREMIUM_LIMIT || 999),
  vip: process.env.VIP_LIMIT || 'VIP'
};


global.uang = {
  free: parseInt(process.env.FREE_UANG || 10000),
  premium: parseInt(process.env.PREMIUM_UANG || 1000000),
  vip: parseInt(process.env.VIP_UANG || 10000000)
};


global.mess = {
  error: process.env.ERROR_MESSAGE || 'unsuccessful!',
  nsfw: process.env.NSFW_MESSAGE || 'Nsfw is disabled in this group, Please tell the admin to activate it',
  done: process.env.DONE_MESSAGE || 'successful'
};


global.bot = {
  limit: 0,
  uang: 0
};


global.game = {
  suit: {},
  menfes: {},
  tictactoe: {},
  kuismath: {},
  tebakbom: {},
};


//------------< PROCESS >------------\\

// Watch for file changes
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Updated ${__filename}`));
  delete require.cache[file];
  require(file);
});
