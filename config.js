//#ENJOY
const fs = require("fs-extra");
if (fs.existsSync(".env"))
  require("dotenv").config({ path: __dirname + "/.env" });
global.audio = "";
global.video = "";
global.port = process.env.PORT;
global.appUrl = process.env.APP_URL || "";
global.email = "wallyjay123@gmail.com";
global.location = "Abuja, Nigeria";
global.mongodb = process.env.MONGODB_URI || "";
global.allowJids = process.env.ALLOW_JID || "null";
global.blockJids = process.env.BLOCK_JID || "null";
global.DATABASE_URL = process.env.DATABASE_URL || "";
global.timezone = process.env.TZ || process.env.TIME_ZONE || "Africa/Lagos";
global.github = process.env.GITHUB || "https://github.com/Wallyjaytechh/WALLYJAYTECH-MD";
global.gurl = process.env.GURL || "https://chat.whatsapp.com/HF1NuB6nFBaIwdGWgeGtni";
global.website = process.env.GURL || "https://wa.me/2348144317152";
global.THUMB_IMAGE = process.env.THUMB_IMAGE || process.env.IMAGE || "https://fv5-5.files.fm/down.php?i=xygcscr7dm&view&n=IMG-20241101-WA0062.jpg";
global.devs = "https://t.me/svenanjafrieda";
global.sudo = process.env.SUDO || "2348144317152,2348155763709,2348054984935";
global.owner = process.env.OWNER_NUMBER || "2348144317152";
global.style = process.env.STYLE || "3";
global.gdbye = process.env.GOODBYE || "true";
global.wlcm = process.env.WELCOME || "true";
global.warncount = process.env.WARN_COUNT || 3;
global.disablepm = process.env.DISABLE_PM || "false";
global.disablegroup = process.env.DISABLE_GROUPS || "false",
global.MsgsInLog = process.env.MSGS_IN_LOG || "true";
global.userImages = process.env.USER_IMAGES || "https://fv5-5.files.fm/down.php?i=xygcscr7dm&view&n=IMG-20241101-WA0062.jpg";
global.waPresence = process.env.WAPRESENCE || "composimg";
global.readcmds = process.env.READ_COMMAND || "false";
global.readmessage = process.env.READ_MESSAGE || "true";
global.readmessagefrom = process.env.READ_MESSAGE_FROM || "";
global.read_status = process.env.AUTO_READ_STATUS || "true";
global.save_status = process.env.AUTO_SAVE_STATUS || "false";
global.save_status_from = process.env.SAVE_STATUS_FROM || "2348054984952";
global.read_status_from = process.env.READ_STATUS_FROM || "";

global.api_smd = "https://api-smd-1.vercel.app";
global.scan = "https://secret-garden-43998-4daad95d4561.herokuapp.com/";

global.SESSION_ID =
  process.env.SESSION_ID ||
  "eyJub2lzZUtleSI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiT0VkaHc2VUFKTFRSMjhkTFJ1RFpHbWJpK013S2prSk1jTEtYQisreFlVQT0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoieURxZkVaaXlGc3cwUUtYYjRSdzMxMW93YTUxRnAvY25pQVNRajZtUUxDZz0ifX0sInBhaXJpbmdFcGhlbWVyYWxLZXlQYWlyIjp7InByaXZhdGUiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJXRDdtM0g1UnZJd3hreU96eWp2eXVsVHMvb0FmYXdvZEJaZXVkQzJ5dUVVPSJ9LCJwdWJsaWMiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJiRTZ5MEZqNk5Zck1DcHpDK3hqQ1cyT2dhb1FDZ2w4TkdQNFBmL3IydFFBPSJ9fSwic2lnbmVkSWRlbnRpdHlLZXkiOnsicHJpdmF0ZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IkNHVVNmSU5lZ01TWXZMZUNnQ3Awam1aZlRZV0FUWUsyMW5WWjZwMmQ5a3M9In0sInB1YmxpYyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IldQTFZ5eVBaRHVWT2lhd2g3dTJwd1pwKzZOVXRGbGUxdjhXR1NReWVQejg9In19LCJzaWduZWRQcmVLZXkiOnsia2V5UGFpciI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiS0NWMWIzKzY4VGZUZnNiYjByVWZlTi92NUs2V044WHE0UEVJcjJYN0xHQT0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiVkFEbnNMcUNDSVJLZGhxa3dNWWp0RHNocVFPQnlWQ25Sa25GV3kzOUV5dz0ifX0sInNpZ25hdHVyZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IkpWTTdKOCszSVFqSDdEcndETWJHb1pjM3gyK1dXWDVCSXVJNkFIR05SRmRxSzdJenVKU0JPbXpvYS8yaTBzWkU4d2tQSHZqWk1aZ1Y0WGdUMGhMWWhBPT0ifSwia2V5SWQiOjF9LCJyZWdpc3RyYXRpb25JZCI6MjQ0LCJhZHZTZWNyZXRLZXkiOiJMa3VnNUhnYlIvMUUwSVRYQ2F4T080VzBPS21zNkpxVWNQRm1na0pLQk5JPSIsInByb2Nlc3NlZEhpc3RvcnlNZXNzYWdlcyI6W3sia2V5Ijp7InJlbW90ZUppZCI6IjIzNDgxNDQzMTcxNTJAcy53aGF0c2FwcC5uZXQiLCJmcm9tTWUiOnRydWUsImlkIjoiQkZGNjQwQTg1MDVFMjU4OUUwOTJENUFEQzQzM0YyRUUifSwibWVzc2FnZVRpbWVzdGFtcCI6MTczMDUwMjEyNH1dLCJuZXh0UHJlS2V5SWQiOjMxLCJmaXJzdFVudXBsb2FkZWRQcmVLZXlJZCI6MzEsImFjY291bnRTeW5jQ291bnRlciI6MCwiYWNjb3VudFNldHRpbmdzIjp7InVuYXJjaGl2ZUNoYXRzIjpmYWxzZX0sImRldmljZUlkIjoiY2dHcHJraHBSNnVpb3hpUldIRWNzQSIsInBob25lSWQiOiIwNjQ3OTI0Yy0wNzIxLTQ0OTMtOThlMC0yZGViNTMzYTIxMTQiLCJpZGVudGl0eUlkIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiUTJiSVRaY2JIRUM0ZWhudU1vYlNMQjAvU24wPSJ9LCJyZWdpc3RlcmVkIjp0cnVlLCJiYWNrdXBUb2tlbiI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6Ikl0SFdZbDJuT09WaVB4RXl5VUZGRGp4dlhXcz0ifSwicmVnaXN0cmF0aW9uIjp7fSwicGFpcmluZ0NvZGUiOiJMMkRCR0M4RyIsIm1lIjp7ImlkIjoiMjM0ODE0NDMxNzE1Mjo4OEBzLndoYXRzYXBwLm5ldCJ9LCJhY2NvdW50Ijp7ImRldGFpbHMiOiJDUC9rMzZnRkVOdTdsYmtHR0FFZ0FDZ0EiLCJhY2NvdW50U2lnbmF0dXJlS2V5IjoiUTBtbFhlalBIZlZkNTFYZXpLcEt2VWJMSysyemVka2NnWkg4MTlicEhnND0iLCJhY2NvdW50U2lnbmF0dXJlIjoiekFkMS9VVVd4cERBTk9zNEtDby8vdnhWT2lTdDg1QzErVFlPSDIwTlFlZ0VYSjZxU2tsZkdGMFl0RlFGZ3d1NWFKWWhIU0RHa3phVVY5Ty9iV01CQ1E9PSIsImRldmljZVNpZ25hdHVyZSI6IjNNMTYzWjVJUy96cGM4dmNuQ0xZZG5CeWJBVENLTlUwRjBmT09KMExXRUF0M0s1eVJaSUhhMDYraEVuZVdSei9JZXYwcUNsb1RxRTlYOWtoWWVWOGlRPT0ifSwic2lnbmFsSWRlbnRpdGllcyI6W3siaWRlbnRpZmllciI6eyJuYW1lIjoiMjM0ODE0NDMxNzE1Mjo4OEBzLndoYXRzYXBwLm5ldCIsImRldmljZUlkIjowfSwiaWRlbnRpZmllcktleSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IkJVTkpwVjNvengzMVhlZFYzc3lxU3IxR3l5dnRzM25aSElHUi9OZlc2UjRPIn19XSwicGxhdGZvcm0iOiJhbmRyb2lkIiwibGFzdEFjY291bnRTeW5jVGltZXN0YW1wIjoxNzMwNTAyMTIwLCJteUFwcFN0YXRlS2V5SWQiOiJBQUFBQUpRdyJ9"
module.exports = {
  menu: process.env.MENU || "3",
  HANDLERS: process.env.PREFIX || ".",
  BRANCH: process.env.BRANCH || "main",
  VERSION: process.env.VERSION || "1.0",
  caption: process.env.CAPTION || "INVENTED BY WALLY JAY TECH",
  author: process.env.PACK_AUTHER || "WALLYJAYTECH-MD",
  packname: process.env.PACK_NAME || "WALLY JAY TECH",
  botname: process.env.BOT_NAME || "WALLYJAYTECH-MD",
  ownername: process.env.OWNER_NAME || "WALLY JAY TECH",
  errorChat: process.env.ERROR_CHAT || "",
  KOYEB_API: process.env.KOYEB_API || "false",
  REMOVE_BG_KEY: process.env.REMOVE_BG_KEY || "dyrbNSNtMf1CE84he61DR7Wx",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  HEROKU_API_KEY: process.env.HEROKU_API_KEY || "",
  HEROKU_APP_NAME: process.env.HEROKU_APP_NAME || "",
  antilink_values: process.env.ANTILINK_VALUES || "all",
  HEROKU: process.env.HEROKU_APP_NAME && process.env.HEROKU_API_KEY,
  aitts_Voice_Id: process.env.AITTS_ID || "37",
  ELEVENLAB_API_KEY: process.env.ELEVENLAB_API_KEY || "",
  WORKTYPE: process.env.WORKTYPE || process.env.MODE || "private",
  LANG: (process.env.THEME || "WALLYJAYTECH-MD").toUpperCase(),
};
global.rank = "updated";
global.isMongodb = false;
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(`Update'${__filename}'`);
  delete require.cache[file];
  require(file);
});
