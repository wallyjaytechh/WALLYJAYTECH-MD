//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                                                                                                                        //
//                                                             𝐖𝐀𝐋𝐋𝐘𝐉𝐀𝐘𝐓𝐄𝐂𝐇-𝐌𝐃 𝐁𝐎𝐓                                                                                                     //
//                                                                                                                                                                                        //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                                                                                                                                        //
//                                                                                                                                                                                        //
//                ██╗    ██╗ █████╗ ██╗     ██╗  ██╗   ██╗   ██╗ █████╗ ██╗   ██╗████████╗███████╗ ██████╗██╗  ██╗      ███╗   ███╗██████╗                                 //
//                ██║    ██║██╔══██╗██║     ██║  ╚██╗ ██╔╝   ██║██╔══██╗╚██╗ ██╔╝╚══██╔══╝██╔════╝██╔════╝██║  ██║      ████╗ ████║██╔══██╗                              //
//                ██║ █╗ ██║███████║██║     ██║   ╚████╔╝    ██║███████║ ╚████╔╝    ██║   █████╗  ██║     ███████║█████╗██╔████╔██║██║  ██║                               //
//                ██║███╗██║██╔══██║██║     ██║    ╚██╔╝██   ██║██╔══██║  ╚██╔╝     ██║   ██╔══╝  ██║     ██╔══██║╚════╝██║╚██╔╝██║██║  ██║                               //
//                ╚███╔███╔╝██║  ██║███████╗███████╗██║ ╚█████╔╝██║  ██║   ██║      ██║   ███████╗╚██████╗██║  ██║      ██║ ╚═╝ ██║██████╔╝                              //
//                 ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚════╝ ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═╝      ╚═╝     ╚═╝╚═════╝                                 //
//                                                                                                                                                                                        //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2025                                                                                                        //
//                                                                                                                                                                                        //
//                                                                                                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * project_name : WALLYJAYTECH-MD
//  * author : wallyjaytech
//  * youtube : https://www.youtube.com/wallyjaytechy
//  * description : WALLYJAYTECH-MD ,A Multi-Device whatsapp user bot.
//*
//*
//re-upload? recode? copy code? give credit to wallyjaytech 2025:)
//Instagram: wallyjaytech
//Telegram: t.me/wallyjaytech
//GitHub: wallyjaytechh
//WhatsApp: +2348144317152
//want more free bot scripts? subscribe to my youtube channel: https://youtube.com/@wallyjaytechy
//   * Created By Github: wallyjaytechh.
//   * Credit To ally jay tech
//   * © 2025 WALLYJAYTECH-MD.
// ⛥┌┤
// */

const log = (...args) => process.stderr.write(args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ') + '\n');

const c = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgGreen: '\x1b[42m',
    bgBlack: '\x1b[40m',
    bold: '\x1b[1m',
};

const fs = require('fs');
const path = require('path');

function getDeploymentPlatform() {
    if (process.env.RENDER) return 'Render';
    if (process.env.CODESPACE_NAME) return 'Codespaces';
    if (process.env.PANEL_APP) return 'Panel';
    if (process.env.REPL_SLUG) return 'Replit';
    if (process.env.KOYEB_APP) return 'Koyeb';
    if (process.env.FLY_APP_NAME) return 'Fly.io';
    if (process.env.GLITCH_PROJECT_ID) return 'Glitch';
    if (process.env.VERCEL) return 'Vercel';
    if (process.env.HEROKU_APP_NAME) return 'Heroku';
    if (process.env.RAILWAY_ENVIRONMENT) return 'Railway';
    return 'Local Machine';
}

global.File = class File {};
require('./settings');
require('dotenv').config();
const { Boom } = require('@hapi/boom');
const { handleMessages, handleGroupParticipantUpdate } = require('./main');

try { const autorecord = require('./commands/autorecord'); autorecord.stopAllInfiniteRecordings(); } catch (e) {}
try { const autotyping = require('./commands/autotyping'); autotyping.stopAllInfiniteTyping(); } catch (e) {}

const { handleStatusUpdate, handleBulkStatusUpdate } = require('./commands/autostatus');
const { storeMessage } = require('./commands/antidelete');
const PhoneNumber = require('awesome-phonenumber');
const { smsg } = require('./lib/myfunc');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, jidDecode, jidNormalizedUser, makeCacheableSignalKeyStore, delay } = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const pino = require("pino");
const readline = require("readline");
const { rmSync } = require('fs');

// Import font and style functions
const { getCurrentFont, applyFont } = require('./commands/menufont');
const { getCurrentStyle } = require('./commands/menustyle');

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const store = require('./lib/lightweight_store');
store.readFromFile();
const settings = require('./settings');

setInterval(() => { try { store.writeToFile(); } catch (e) {} }, settings.storeWriteInterval || 10000);

function readStatusConfig() {
    try { const p = path.join(__dirname, 'data', 'autostatus.json'); if (fs.existsSync(p)) { const c = JSON.parse(fs.readFileSync(p, 'utf8')); return { enabled: c.enabled === true, likeOn: c.likeOn === true, selfOn: c.selfOn === true }; } } catch (e) {}
    return { enabled: false, likeOn: false, selfOn: false };
}
function getBotMode() {
    try { const p = path.join(__dirname, 'data', 'messageCount.json'); if (fs.existsSync(p)) { const d = JSON.parse(fs.readFileSync(p, 'utf8')); if (typeof d.isPublic === 'boolean') return d.isPublic ? 'Public' : 'Private'; } return 'Public'; } catch (e) { return 'Public'; }
}

setInterval(() => { const memMB = process.memoryUsage().rss / 1024 / 1024; if (memMB > 500) { if (global.gc) global.gc(); } if (memMB > 700) process.exit(1); }, 5 * 60 * 1000);
setInterval(() => { if (global.gc) global.gc(); }, 60000);

let phoneNumber = "2348155763709";
let owner = JSON.parse(fs.readFileSync('./data/owner.json'));
global.botname = "WALLYJAYTECH-MD";
global.themeemoji = "🤖";
const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code");
const useMobile = process.argv.includes("--mobile");
const rl = process.stdin.isTTY ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null;
const question = (text) => rl ? new Promise((resolve) => rl.question(text, resolve)) : Promise.resolve(settings.ownerNumber || phoneNumber);

function getCommandCount() {
    try {
        const helpPath = path.join(__dirname, 'commands', 'help.js');
        const c = fs.readFileSync(helpPath, 'utf8');
        const match = c.match(/const allCommandsRaw = \{([\s\S]*?)\};/);
        if (!match) return 200;
        const commands = match[1].match(/\.\w+/g);
        return commands ? new Set(commands).size : 200;
    } catch (e) { return 200; }
}

// ---- CONNECTION MESSAGE TRANSLATIONS (All 23 Languages) ----
const connectionTranslations = {
    'en': {
        bot_connected: "BOT CONNECTED",
        date: "Date",
        time: "Time",
        status: "Status",
        online: "Online",
        version: "Version",
        owner: "Owner",
        contact: "Contact",
        prefix: "Prefix",
        mode: "Mode",
        private: "Private",
        public: "Public",
        commands: "Commands",
        quick_start: "QUICK START",
        all_commands: "All commands",
        bot_guide: "Bot guide",
        contact_owner: "Contact owner",
        bot_settings: "Bot settings",
        check_speed: "Check speed",
        update_bot: "Update bot",
        connect: "CONNECT",
        support_group: "Support Group",
        youtube_channel: "YouTube Channel",
        github_repo: "GitHub Repo",
        channel_updates: "Channel Updates",
        links: "LINKS",
        whatsapp_channel: "WhatsApp Channel",
        support_group_link: "Support group",
        youtube: "YouTube",
        github: "GitHub",
        copyright: "COPYRIGHT",
        all_rights: "All Rights Reserved",
        wallyjaytech: "WALLYJAYTECH-MD"
    },
    'ha': {
        bot_connected: "BOT YA HADA",
        date: "Kwanan wata",
        time: "Lokaci",
        status: "Matsayi",
        online: "Kan layi",
        version: "Sigar",
        owner: "Mai shi",
        contact: "Lambar sadarwa",
        prefix: "Prefix",
        mode: "Yanayi",
        private: "Keɓaɓɓe",
        public: "Jama'a",
        commands: "Umurnai",
        quick_start: "FARA DA SAURI",
        all_commands: "Duk umurnai",
        bot_guide: "Jagoran bot",
        contact_owner: "Tuntuɓi mai shi",
        bot_settings: "Saitin bot",
        check_speed: "Duba saurin",
        update_bot: "Sabunta bot",
        connect: "HADA",
        support_group: "Rukunin Taimako",
        youtube_channel: "Tashar YouTube",
        github_repo: "Taskar GitHub",
        channel_updates: "Sabuntawar Tashar",
        links: "HANYOYIN",
        whatsapp_channel: "Tashar WhatsApp",
        support_group_link: "Rukunin taimako",
        youtube: "YouTube",
        github: "GitHub",
        copyright: "HAKIN MALLKA",
        all_rights: "An Kiyaye Duk Hakkoki",
        wallyjaytech: "WALLYJAYTECH-MD"
    },
    'yo': {
        bot_connected: "BOT TI SO PỌ",
        date: "Ọjọ́",
        time: "Àkókò",
        status: "Ipò",
        online: "Lori ayelujara",
        version: "Ẹ̀yà",
        owner: "Onílé",
        contact: "Kán sí",
        prefix: "Àmì",
        mode: "Ipo",
        private: "Ikọkọ",
        public: "Gbangba",
        commands: "Àṣẹ",
        quick_start: "IBẸRỀ KIA KIA",
        all_commands: "Gbogbo àṣẹ",
        bot_guide: "Ìtọ́sọ́nà bot",
        contact_owner: "Kán sí onílé",
        bot_settings: "Ètò bot",
        check_speed: "Ṣayẹwo iyara",
        update_bot: "Mú bot dọ́gba",
        connect: "SOPỌ",
        support_group: "Ẹgbẹ́ Ìrànlọ́wọ́",
        youtube_channel: "Ikan YouTube",
        github_repo: "Ibi Ìpamọ́ GitHub",
        channel_updates: "Àwọn ìmúdọ́gba ikani",
        links: "Ọ̀NÀ",
        whatsapp_channel: "Ikan WhatsApp",
        support_group_link: "Ẹgbẹ́ ìrànlọ́wọ́",
        youtube: "YouTube",
        github: "GitHub",
        copyright: "Ẹ̀TỌ́",
        all_rights: "Gbogbo Ẹ̀tọ́ Ni A Dáàbò Bò",
        wallyjaytech: "WALLYJAYTECH-MD"
    },
    'ig': {
        bot_connected: "BOT EJIKỌTARA",
        date: "Ụbọchị",
        time: "Oge",
        status: "Ọnọdụ",
        online: "N'ịntanị",
        version: "Ụdị",
        owner: "Onyenwe",
        contact: "Kpọtụrụ",
        prefix: "Prefix",
        mode: "Ọnọdụ",
        private: "Nkeonwe",
        public: "Ọha",
        commands: "Iwu",
        quick_start: "MALITE NGWA",
        all_commands: "Iwu niile",
        bot_guide: "Ntuziaka bot",
        contact_owner: "Kpọtụrụ onyenwe",
        bot_settings: "Ntọala bot",
        check_speed: "Lelee ọsọ",
        update_bot: "Emelite bot",
        connect: "JIKỌ",
        support_group: "Otu Nkwado",
        youtube_channel: "Ọwa YouTube",
        github_repo: "Ebe Nchekwa GitHub",
        channel_updates: "Mmelite Ọwa",
        links: "NKWU",
        whatsapp_channel: "Ọwa WhatsApp",
        support_group_link: "Otu nkwado",
        youtube: "YouTube",
        github: "GitHub",
        copyright: "IKIKE",
        all_rights: "Edebere Ikike Niile",
        wallyjaytech: "WALLYJAYTECH-MD"
    },
    'fr': {
        bot_connected: "BOT CONNECTÉ",
        date: "Date",
        time: "Heure",
        status: "Statut",
        online: "En ligne",
        version: "Version",
        owner: "Propriétaire",
        contact: "Contact",
        prefix: "Préfixe",
        mode: "Mode",
        private: "Privé",
        public: "Public",
        commands: "Commandes",
        quick_start: "DÉMARRAGE RAPIDE",
        all_commands: "Toutes les commandes",
        bot_guide: "Guide du bot",
        contact_owner: "Contacter le propriétaire",
        bot_settings: "Paramètres du bot",
        check_speed: "Vérifier la vitesse",
        update_bot: "Mettre à jour le bot",
        connect: "CONNEXION",
        support_group: "Groupe de support",
        youtube_channel: "Chaîne YouTube",
        github_repo: "Dépôt GitHub",
        channel_updates: "Mises à jour de la chaîne",
        links: "LIENS",
        whatsapp_channel: "Chaîne WhatsApp",
        support_group_link: "Groupe de support",
        youtube: "YouTube",
        github: "GitHub",
        copyright: "DROITS D'AUTEUR",
        all_rights: "Tous droits réservés",
        wallyjaytech: "WALLYJAYTECH-MD"
    },
    'de': {
        bot_connected: "BOT VERBUNDEN",
        date: "Datum",
        time: "Uhrzeit",
        status: "Status",
        online: "Online",
        version: "Version",
        owner: "Besitzer",
        contact: "Kontakt",
        prefix: "Präfix",
        mode: "Modus",
        private: "Privat",
        public: "Öffentlich",
        commands: "Befehle",
        quick_start: "SCHNELLSTART",
        all_commands: "Alle Befehle",
        bot_guide: "Bot-Anleitung",
        contact_owner: "Besitzer kontaktieren",
        bot_settings: "Bot-Einstellungen",
        check_speed: "Geschwindigkeit prüfen",
        update_bot: "Bot aktualisieren",
        connect: "VERBINDEN",
        support_group: "Support-Gruppe",
        youtube_channel: "YouTube-Kanal",
        github_repo: "GitHub-Repo",
        channel_updates: "Kanal-Updates",
        links: "LINKS",
        whatsapp_channel: "WhatsApp-Kanal",
        support_group_link: "Support-Gruppe",
        youtube: "YouTube",
        github: "GitHub",
        copyright: "URHEBERRECHT",
        all_rights: "Alle Rechte vorbehalten",
        wallyjaytech: "WALLYJAYTECH-MD"
    },
    'ar': {
        bot_connected: "البوت متصل",
        date: "التاريخ",
        time: "الوقت",
        status: "الحالة",
        online: "متصل",
        version: "الإصدار",
        owner: "المالك",
        contact: "الاتصال",
        prefix: "البادئة",
        mode: "الوضع",
        private: "خاص",
        public: "عام",
        commands: "الأوامر",
        quick_start: "بداية سريعة",
        all_commands: "جميع الأوامر",
        bot_guide: "دليل البوت",
        contact_owner: "اتصل بالمالك",
        bot_settings: "إعدادات البوت",
        check_speed: "تحقق من السرعة",
        update_bot: "تحديث البوت",
        connect: "اتصال",
        support_group: "مجموعة الدعم",
        youtube_channel: "قناة يوتيوب",
        github_repo: "مستودع جيثب",
        channel_updates: "تحديثات القناة",
        links: "روابط",
        whatsapp_channel: "قناة واتساب",
        support_group_link: "مجموعة الدعم",
        youtube: "يوتيوب",
        github: "جيثب",
        copyright: "حقوق النشر",
        all_rights: "جميع الحقوق محفوظة",
        wallyjaytech: "WALLYJAYTECH-MD"
    },
    'zh': {
        bot_connected: "机器人已连接",
        date: "日期",
        time: "时间",
        status: "状态",
        online: "在线",
        version: "版本",
        owner: "所有者",
        contact: "联系方式",
        prefix: "前缀",
        mode: "模式",
        private: "私有",
        public: "公开",
        commands: "命令",
        quick_start: "快速开始",
        all_commands: "所有命令",
        bot_guide: "机器人指南",
        contact_owner: "联系所有者",
        bot_settings: "机器人设置",
        check_speed: "检查速度",
        update_bot: "更新机器人",
        connect: "连接",
        support_group: "支持群组",
        youtube_channel: "YouTube 频道",
        github_repo: "GitHub 仓库",
        channel_updates: "频道更新",
        links: "链接",
        whatsapp_channel: "WhatsApp 频道",
        support_group_link: "支持群组",
        youtube: "YouTube",
        github: "GitHub",
        copyright: "版权",
        all_rights: "版权所有",
        wallyjaytech: "WALLYJAYTECH-MD"
    },
    'hi': {
        bot_connected: "बॉट कनेक्टेड",
        date: "तारीख",
        time: "समय",
        status: "स्थिति",
        online: "ऑनलाइन",
        version: "संस्करण",
        owner: "मालिक",
        contact: "संपर्क",
        prefix: "उपसर्ग",
        mode: "मोड",
        private: "निजी",
        public: "सार्वजनिक",
        commands: "कमांड",
        quick_start: "त्वरित प्रारंभ",
        all_commands: "सभी कमांड",
        bot_guide: "बॉट गाइड",
        contact_owner: "मालिक से संपर्क करें",
        bot_settings: "बॉट सेटिंग्स",
        check_speed: "गति जांचें",
        update_bot: "बॉट अपडेट करें",
        connect: "कनेक्ट",
        support_group: "सहायता समूह",
        youtube_channel: "यूट्यूब चैनल",
        github_repo: "गिथब रिपो",
        channel_updates: "चैनल अपडेट",
        links: "लिंक",
        whatsapp_channel: "व्हाट्सएप चैनल",
        support_group_link: "सहायता समूह",
        youtube: "यूट्यूब",
        github: "गिथब",
        copyright: "कॉपीराइट",
        all_rights: "सभी अधिकार सुरक्षित",
        wallyjaytech: "WALLYJAYTECH-MD"
    },
    'es': {
        bot_connected: "BOT CONECTADO",
        date: "Fecha",
        time: "Hora",
        status: "Estado",
        online: "En línea",
        version: "Versión",
        owner: "Propietario",
        contact: "Contacto",
        prefix: "Prefijo",
        mode: "Modo",
        private: "Privado",
        public: "Público",
        commands: "Comandos",
        quick_start: "INICIO RÁPIDO",
        all_commands: "Todos los comandos",
        bot_guide: "Guía del bot",
        contact_owner: "Contactar al propietario",
        bot_settings: "Configuración del bot",
        check_speed: "Verificar velocidad",
        update_bot: "Actualizar bot",
        connect: "CONECTAR",
        support_group: "Grupo de soporte",
        youtube_channel: "Canal de YouTube",
        github_repo: "Repositorio de GitHub",
        channel_updates: "Actualizaciones del canal",
        links: "ENLACES",
        whatsapp_channel: "Canal de WhatsApp",
        support_group_link: "Grupo de soporte",
        youtube: "YouTube",
        github: "GitHub",
        copyright: "DERECHOS DE AUTOR",
        all_rights: "Todos los derechos reservados",
        wallyjaytech: "WALLYJAYTECH-MD"
    },
    'pt': {
        bot_connected: "BOT CONECTADO",
        date: "Data",
        time: "Hora",
        status: "Status",
        online: "Online",
        version: "Versão",
        owner: "Proprietário",
        contact: "Contato",
        prefix: "Prefixo",
        mode: "Modo",
        private: "Privado",
        public: "Público",
        commands: "Comandos",
        quick_start: "INÍCIO RÁPIDO",
        all_commands: "Todos os comandos",
        bot_guide: "Guia do bot",
        contact_owner: "Contatar proprietário",
        bot_settings: "Configurações do bot",
        check_speed: "Verificar velocidade",
        update_bot: "Atualizar bot",
        connect: "CONECTAR",
        support_group: "Grupo de suporte",
        youtube_channel: "Canal do YouTube",
        github_repo: "Repositório do GitHub",
        channel_updates: "Atualizações do canal",
        links: "LINKS",
        whatsapp_channel: "Canal do WhatsApp",
        support_group_link: "Grupo de suporte",
        youtube: "YouTube",
        github: "GitHub",
        copyright: "DIREITOS AUTORAIS",
        all_rights: "Todos os direitos reservados",
        wallyjaytech: "WALLYJAYTECH-MD"
    },
    'ru': {
        bot_connected: "БОТ ПОДКЛЮЧЁН",
        date: "Дата",
        time: "Время",
        status: "Статус",
        online: "Онлайн",
        version: "Версия",
        owner: "Владелец",
        contact: "Контакт",
        prefix: "Префикс",
        mode: "Режим",
        private: "Частный",
        public: "Публичный",
        commands: "Команды",
        quick_start: "БЫСТРЫЙ СТАРТ",
        all_commands: "Все команды",
        bot_guide: "Руководство по боту",
        contact_owner: "Связаться с владельцем",
        bot_settings: "Настройки бота",
        check_speed: "Проверить скорость",
        update_bot: "Обновить бота",
        connect: "ПОДКЛЮЧИТЬ",
        support_group: "Группа поддержки",
        youtube_channel: "YouTube канал",
        github_repo: "GitHub репозиторий",
        channel_updates: "Обновления канала",
        links: "ССЫЛКИ",
        whatsapp_channel: "WhatsApp канал",
        support_group_link: "Группа поддержки",
        youtube: "YouTube",
        github: "GitHub",
        copyright: "АВТОРСКИЕ ПРАВА",
        all_rights: "Все права защищены",
        wallyjaytech: "WALLYJAYTECH-MD"
    },
    'ur': {
        bot_connected: "بوٹ منسلک",
        date: "تاریخ",
        time: "وقت",
        status: "حالت",
        online: "آن لائن",
        version: "ورژن",
        owner: "مالک",
        contact: "رابطہ",
        prefix: "سابقہ",
        mode: "موڈ",
        private: "نجی",
        public: "عوامی",
        commands: "کمانڈز",
        quick_start: "فوری آغاز",
        all_commands: "تمام کمانڈز",
        bot_guide: "بوٹ گائیڈ",
        contact_owner: "مالک سے رابطہ کریں",
        bot_settings: "بوٹ کی ترتیبات",
        check_speed: "رفتار چیک کریں",
        update_bot: "بوٹ اپ ڈیٹ کریں",
        connect: "منسلک کریں",
        support_group: "سپورٹ گروپ",
        youtube_channel: "یوٹیوب چینل",
        github_repo: "گٹ ہب ریپو",
        channel_updates: "چینل اپ ڈیٹس",
        links: "لنکس",
        whatsapp_channel: "واٹس ایپ چینل",
        support_group_link: "سپورٹ گروپ",
        youtube: "یوٹیوب",
        github: "گٹ ہب",
        copyright: "کاپی رائٹ",
        all_rights: "جملہ حقوق محفوظ ہیں",
        wallyjaytech: "WALLYJAYTECH-MD"
    },
    'bn': {
        bot_connected: "বট সংযুক্ত",
        date: "তারিখ",
        time: "সময়",
        status: "অবস্থা",
        online: "অনলাইন",
        version: "সংস্করণ",
        owner: "মালিক",
        contact: "যোগাযোগ",
        prefix: "উপসর্গ",
        mode: "মোড",
        private: "ব্যক্তিগত",
        public: "পাবলিক",
        commands: "কমান্ড",
        quick_start: "দ্রুত শুরু",
        all_commands: "সমস্ত কমান্ড",
        bot_guide: "বট গাইড",
        contact_owner: "মালিকের সাথে যোগাযোগ করুন",
        bot_settings: "বট সেটিংস",
        check_speed: "গতি পরীক্ষা করুন",
        update_bot: "বট আপডেট করুন",
        connect: "সংযোগ",
        support_group: "সাপোর্ট গ্রুপ",
        youtube_channel: "ইউটিউব চ্যানেল",
        github_repo: "গিটহাব রেপো",
        channel_updates: "চ্যানেল আপডেট",
        links: "লিংক",
        whatsapp_channel: "ওয়াটসঅ্যাপ চ্যানেল",
        support_group_link: "সাপোর্ট গ্রুপ",
        youtube: "ইউটিউব",
        github: "গিটহাব",
        copyright: "কপিরাইট",
        all_rights: "সর্বস্বত্ব সংরক্ষিত",
        wallyjaytech: "WALLYJAYTECH-MD"
    },
    'pcm': {
        bot_connected: "BOT DON CONNECT",
        date: "Date",
        time: "Time",
        status: "Status",
        online: "Online",
        version: "Version",
        owner: "Owner",
        contact: "Contact",
        prefix: "Prefix",
        mode: "Mode",
        private: "Private",
        public: "Public",
        commands: "Commands",
        quick_start: "KWIK START",
        all_commands: "All commands",
        bot_guide: "Bot guide",
        contact_owner: "Contact owner",
        bot_settings: "Bot settings",
        check_speed: "Check speed",
        update_bot: "Update bot",
        connect: "CONNECT",
        support_group: "Support Group",
        youtube_channel: "YouTube Channel",
        github_repo: "GitHub Repo",
        channel_updates: "Channel Updates",
        links: "LINKS",
        whatsapp_channel: "WhatsApp Channel",
        support_group_link: "Support group",
        youtube: "YouTube",
        github: "GitHub",
        copyright: "COPYRIGHT",
        all_rights: "All Rights Reserved",
        wallyjaytech: "WALLYJAYTECH-MD"
    },
    'it': {
        bot_connected: "BOT CONNESSO",
        date: "Data",
        time: "Ora",
        status: "Stato",
        online: "Online",
        version: "Versione",
        owner: "Proprietario",
        contact: "Contatto",
        prefix: "Prefisso",
        mode: "Modalità",
        private: "Privato",
        public: "Pubblico",
        commands: "Comandi",
        quick_start: "AVVIO RAPIDO",
        all_commands: "Tutti i comandi",
        bot_guide: "Guida del bot",
        contact_owner: "Contatta il proprietario",
        bot_settings: "Impostazioni del bot",
        check_speed: "Controlla velocità",
        update_bot: "Aggiorna bot",
        connect: "CONNETTI",
        support_group: "Gruppo di supporto",
        youtube_channel: "Canale YouTube",
        github_repo: "Repository GitHub",
        channel_updates: "Aggiornamenti del canale",
        links: "COLLEGAMENTI",
        whatsapp_channel: "Canale WhatsApp",
        support_group_link: "Gruppo di supporto",
        youtube: "YouTube",
        github: "GitHub",
        copyright: "DIRITTI D'AUTORE",
        all_rights: "Tutti i diritti riservati",
        wallyjaytech: "WALLYJAYTECH-MD"
    },
    'id': {
        bot_connected: "BOT TERHUBUNG",
        date: "Tanggal",
        time: "Waktu",
        status: "Status",
        online: "Online",
        version: "Versi",
        owner: "Pemilik",
        contact: "Kontak",
        prefix: "Awalan",
        mode: "Mode",
        private: "Pribadi",
        public: "Publik",
        commands: "Perintah",
        quick_start: "MULAI CEPAT",
        all_commands: "Semua perintah",
        bot_guide: "Panduan bot",
        contact_owner: "Hubungi pemilik",
        bot_settings: "Pengaturan bot",
        check_speed: "Cek kecepatan",
        update_bot: "Perbarui bot",
        connect: "TERHUBUNG",
        support_group: "Grup Dukungan",
        youtube_channel: "Saluran YouTube",
        github_repo: "Repositori GitHub",
        channel_updates: "Pembaruan Saluran",
        links: "TAUTAN",
        whatsapp_channel: "Saluran WhatsApp",
        support_group_link: "Grup dukungan",
        youtube: "YouTube",
        github: "GitHub",
        copyright: "HAK CIPTA",
        all_rights: "Hak Cipta Dilindungi",
        wallyjaytech: "WALLYJAYTECH-MD"
    },
    'ja': {
        bot_connected: "ボット接続完了",
        date: "日付",
        time: "時間",
        status: "ステータス",
        online: "オンライン",
        version: "バージョン",
        owner: "所有者",
        contact: "連絡先",
        prefix: "プレフィックス",
        mode: "モード",
        private: "非公開",
        public: "公開",
        commands: "コマンド",
        quick_start: "クイックスタート",
        all_commands: "すべてのコマンド",
        bot_guide: "ボットガイド",
        contact_owner: "所有者に連絡",
        bot_settings: "ボット設定",
        check_speed: "速度を確認",
        update_bot: "ボットを更新",
        connect: "接続",
        support_group: "サポートグループ",
        youtube_channel: "YouTubeチャンネル",
        github_repo: "GitHubリポジトリ",
        channel_updates: "チャンネル更新",
        links: "リンク",
        whatsapp_channel: "WhatsAppチャンネル",
        support_group_link: "サポートグループ",
        youtube: "YouTube",
        github: "GitHub",
        copyright: "著作権",
        all_rights: "すべての権利を保有",
        wallyjaytech: "WALLYJAYTECH-MD"
    },
    'sw': {
        bot_connected: "BOT IMESHIKANA",
        date: "Tarehe",
        time: "Saa",
        status: "Hali",
        online: "Mtandaoni",
        version: "Toleo",
        owner: "Mmiliki",
        contact: "Wasiliana",
        prefix: "Kiambishi",
        mode: "Hali",
        private: "Binafsi",
        public: "Umma",
        commands: "Amri",
        quick_start: "ANZA HARAKA",
        all_commands: "Amri zote",
        bot_guide: "Mwongozo wa bot",
        contact_owner: "Wasiliana na mmiliki",
        bot_settings: "Mipangilio ya bot",
        check_speed: "Angalia kasi",
        update_bot: "Sasisha bot",
        connect: "UNGANISHA",
        support_group: "Kikundi cha Msaada",
        youtube_channel: "Kituo cha YouTube",
        github_repo: "Hifadhi ya GitHub",
        channel_updates: "Sasisho za Kituo",
        links: "VIUNGO",
        whatsapp_channel: "Kituo cha WhatsApp",
        support_group_link: "Kikundi cha msaada",
        youtube: "YouTube",
        github: "GitHub",
        copyright: "HAKI MILIKI",
        all_rights: "Haki Zote Zimehifadhiwa",
        wallyjaytech: "WALLYJAYTECH-MD"
    },
    'tr': {
        bot_connected: "BOT BAĞLANDI",
        date: "Tarih",
        time: "Saat",
        status: "Durum",
        online: "Çevrimiçi",
        version: "Sürüm",
        owner: "Sahip",
        contact: "İletişim",
        prefix: "Önek",
        mode: "Mod",
        private: "Özel",
        public: "Genel",
        commands: "Komutlar",
        quick_start: "HIZLI BAŞLANGIÇ",
        all_commands: "Tüm komutlar",
        bot_guide: "Bot kılavuzu",
        contact_owner: "Sahiple iletişime geç",
        bot_settings: "Bot ayarları",
        check_speed: "Hızı kontrol et",
        update_bot: "Botu güncelle",
        connect: "BAĞLAN",
        support_group: "Destek Grubu",
        youtube_channel: "YouTube Kanalı",
        github_repo: "GitHub Deposu",
        channel_updates: "Kanal Güncellemeleri",
        links: "BAĞLANTILAR",
        whatsapp_channel: "WhatsApp Kanalı",
        support_group_link: "Destek grubu",
        youtube: "YouTube",
        github: "GitHub",
        copyright: "TELİF HAKKI",
        all_rights: "Tüm Hakları Saklıdır",
        wallyjaytech: "WALLYJAYTECH-MD"
    },
    'ko': {
        bot_connected: "봇 연결됨",
        date: "날짜",
        time: "시간",
        status: "상태",
        online: "온라인",
        version: "버전",
        owner: "소유자",
        contact: "연락처",
        prefix: "접두사",
        mode: "모드",
        private: "비공개",
        public: "공개",
        commands: "명령어",
        quick_start: "빠른 시작",
        all_commands: "모든 명령어",
        bot_guide: "봇 가이드",
        contact_owner: "소유자에게 연락",
        bot_settings: "봇 설정",
        check_speed: "속도 확인",
        update_bot: "봇 업데이트",
        connect: "연결",
        support_group: "지원 그룹",
        youtube_channel: "YouTube 채널",
        github_repo: "GitHub 저장소",
        channel_updates: "채널 업데이트",
        links: "링크",
        whatsapp_channel: "WhatsApp 채널",
        support_group_link: "지원 그룹",
        youtube: "YouTube",
        github: "GitHub",
        copyright: "저작권",
        all_rights: "모든 권리 보유",
        wallyjaytech: "WALLYJAYTECH-MD"
    },
    'vi': {
        bot_connected: "BOT ĐÃ KẾT NỐI",
        date: "Ngày",
        time: "Giờ",
        status: "Trạng thái",
        online: "Trực tuyến",
        version: "Phiên bản",
        owner: "Chủ sở hữu",
        contact: "Liên hệ",
        prefix: "Tiền tố",
        mode: "Chế độ",
        private: "Riêng tư",
        public: "Công khai",
        commands: "Lệnh",
        quick_start: "BẮT ĐẦU NHANH",
        all_commands: "Tất cả lệnh",
        bot_guide: "Hướng dẫn bot",
        contact_owner: "Liên hệ chủ sở hữu",
        bot_settings: "Cài đặt bot",
        check_speed: "Kiểm tra tốc độ",
        update_bot: "Cập nhật bot",
        connect: "KẾT NỐI",
        support_group: "Nhóm hỗ trợ",
        youtube_channel: "Kênh YouTube",
        github_repo: "Kho GitHub",
        channel_updates: "Cập nhật kênh",
        links: "LIÊN KẾT",
        whatsapp_channel: "Kênh WhatsApp",
        support_group_link: "Nhóm hỗ trợ",
        youtube: "YouTube",
        github: "GitHub",
        copyright: "BẢN QUYỀN",
        all_rights: "Đã đăng ký bản quyền",
        wallyjaytech: "WALLYJAYTECH-MD"
    },
    'ta': {
        bot_connected: "பாட் இணைக்கப்பட்டது",
        date: "தேதி",
        time: "நேரம்",
        status: "நிலை",
        online: "இணையத்தில்",
        version: "பதிப்பு",
        owner: "உரிமையாளர்",
        contact: "தொடர்பு",
        prefix: "முன்னொட்டு",
        mode: "முறை",
        private: "தனியார்",
        public: "பொது",
        commands: "கட்டளைகள்",
        quick_start: "விரைவான தொடக்கம்",
        all_commands: "அனைத்து கட்டளைகள்",
        bot_guide: "பாட் வழிகாட்டி",
        contact_owner: "உரிமையாளரை தொடர்பு கொள்ள",
        bot_settings: "பாட் அமைப்புகள்",
        check_speed: "வேகத்தை சரிபார்க்க",
        update_bot: "பாட்டை புதுப்பிக்க",
        connect: "இணைக்க",
        support_group: "ஆதரவு குழு",
        youtube_channel: "YouTube சேனல்",
        github_repo: "GitHub களஞ்சியம்",
        channel_updates: "சேனல் புதுப்பிப்புகள்",
        links: "இணைப்புகள்",
        whatsapp_channel: "WhatsApp சேனல்",
        support_group_link: "ஆதரவு குழு",
        youtube: "YouTube",
        github: "GitHub",
        copyright: "பதிப்புரிமை",
        all_rights: "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை",
        wallyjaytech: "WALLYJAYTECH-MD"
    }
};

function getConnectionTranslation(langCode, key) {
    return connectionTranslations[langCode]?.[key] || connectionTranslations['en'][key] || key;
}

// ---- AUTO JOIN GROUP ----
async function autoJoinGroup(sock, groupLink, retryCount = 0) {
    const maxRetries = 3;
    try {
        let inviteCode = groupLink;
        if (groupLink.includes('chat.whatsapp.com/')) {
            inviteCode = groupLink.split('chat.whatsapp.com/')[1];
            if (inviteCode.includes('?')) {
                inviteCode = inviteCode.split('?')[0];
            }
        }
        
        log(c.cyan + `🔄 Attempting to join group (attempt ${retryCount + 1})...` + c.reset);
        const result = await sock.groupAcceptInvite(inviteCode);
        log(c.green + '✅ Auto-joined group successfully!' + c.reset);
        return { success: true, method: 'groupAcceptInvite' };
        
    } catch (e) {
        if (e.message && (e.message.includes('already in group') || 
            e.message.includes('already participant') || 
            e.message.includes('401') ||
            e.message.includes('not-authorized'))) {
            log(c.cyan + 'ℹ️ Bot is already in the group' + c.reset);
            return { success: true, method: 'already_in_group' };
        }
        
        if (retryCount < maxRetries) {
            log(c.yellow + `⚠️ Method 1 failed, retrying... (${retryCount + 1}/${maxRetries})` + c.reset);
            await delay(2000 * (retryCount + 1));
            return autoJoinGroup(sock, groupLink, retryCount + 1);
        }
        
        log(c.red + '❌ All join methods failed: ' + e.message + c.reset);
        return { success: false, error: e.message };
    }
}

// ---- AUTO FOLLOW CHANNEL ----
async function autoFollowChannel(sock, channelJid, retryCount = 0) {
    const maxRetries = 3;
    const methods = [
        { name: 'newsletterFollow', fn: async () => await sock.newsletterFollow({ newsletterJid: channelJid }) },
        { name: 'sendMessage', fn: async () => await sock.sendMessage(channelJid, { follow: true }) }
    ];
    
    for (let i = 0; i < methods.length; i++) {
        try {
            const method = methods[i];
            log(c.cyan + `🔄 Trying to follow channel using: ${method.name}...` + c.reset);
            await method.fn();
            log(c.green + `✅ Successfully followed channel using: ${method.name}` + c.reset);
            return { success: true, method: method.name };
        } catch (e) {
            if (e.message && (e.message.includes('already following') || 
                e.message.includes('already subscribed') ||
                e.message.includes('already'))) {
                log(c.cyan + 'ℹ️ Already following the channel' + c.reset);
                return { success: true, method: 'already_following' };
            }
            log(c.yellow + `⚠️ Method ${method.name} failed: ${e.message}` + c.reset);
            if (i < methods.length - 1) {
                await delay(1000);
            }
        }
    }
    
    log(c.red + '❌ All follow methods failed' + c.reset);
    return { success: false, error: 'All methods failed' };
}

// ---- BUILD CONNECTION MESSAGE (Compact Version with NO repeated footers) ----
function buildConnectionMessage(styleId, sections) {
    let fullMessage = '';
    
    for (const section of sections) {
        // --- STYLE 1 ---
        if (styleId === 1) {
            fullMessage += `╭──◆「 *${section.title}* 」◆\n├\n`;
            for (const line of section.lines) {
                fullMessage += `├◇ ${line}\n`;
            }
            fullMessage += `├\n╰─┬─★─☆─♪♪─◆\n\n`;
        }
        // --- STYLE 2 ---
        else if (styleId === 2) {
            fullMessage += `◈──────────────────────◈\n`;
            fullMessage += `           *${section.title}*\n`;
            fullMessage += `◈──────────────────────◈\n\n`;
            for (const line of section.lines) {
                fullMessage += `▤ ${line}\n`;
            }
            fullMessage += `◈──────────────────────◈\n\n`;
        }
        // --- STYLE 3 ---
        else if (styleId === 3) {
            fullMessage += `╔══════════════════╗\n║ *${section.title}*\n║ ══════════════════\n`;
            for (const line of section.lines) {
                fullMessage += `║ ${line}\n`;
            }
            fullMessage += `╚══════════════════╝\n\n`;
        }
        // --- STYLE 4 (Jarvis) ---
        else if (styleId === 4) {
            fullMessage += `╭──〔 *${section.title}* 〕─┈𓊉꧂\n║     ╭──────────────┈❀\n`;
            for (const line of section.lines) {
                fullMessage += `║☠︎︎║ ${line}\n`;
            }
            fullMessage += `║     ╰──────────────┈❀\n╰───────────────────┈𓊉꧂\n\n`;
        }
        // --- STYLE 5 (Swirl) ---
        else if (styleId === 5) {
            fullMessage += `  🌀◈── *${section.title}* ──◈❃🌸❃\n\n╭──────────●●➤\n`;
            for (const line of section.lines) {
                fullMessage += `┊ ${line}\n`;
            }
            fullMessage += `╰──────·••─────•────●○\n\n`;
        }
        // --- STYLE 6 (Love Wing) ---
        else if (styleId === 6) {
            fullMessage += `╭──〈 *${section.title}* 〉──💕⃝🕊️\n`;
            for (const line of section.lines) {
                fullMessage += `⚚  ${line}\n`;
            }
            fullMessage += `╰────────────────✌︎㋡\n\n`;
        }
        // --- STYLE 7 (Aesthetic Bloom) ---
        else if (styleId === 7) {
            fullMessage += `╔══════════════════❥❥❥\n✧  *${section.title}*\n╚══════════════════❥❥❥\n`;
            for (const line of section.lines) {
                fullMessage += `✧  ${line}\n`;
            }
            fullMessage += `\n`;
        }
        // Fallback
        else {
            fullMessage += `╭──◆「 *${section.title}* 」◆\n├\n`;
            for (const line of section.lines) {
                fullMessage += `├◇ ${line}\n`;
            }
            fullMessage += `├\n╰─┬─★─☆─♪♪─◆\n\n`;
        }
    }
    
    // Add final footer ONLY ONCE
    if (styleId === 1) {
        fullMessage += `╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`;
    } else if (styleId === 2) {
        fullMessage += `◈──────────────────────◈\n           *WALLYJAYTECH-MD*\n◈──────────────────────◈`;
    } else if (styleId === 3) {
        fullMessage += `╔══════════════════╗\n║ *WALLYJAYTECH-MD*\n╚══════════════════╝`;
    } else if (styleId === 4) {
        fullMessage += `╭─〔 *WALLYJAYTECH-MD* 〕──┈𓊉꧂\n╰─────────────────┈𓊉꧂`;
    } else if (styleId === 5) {
        fullMessage += `╭──────────●●➤\n┊ *WALLYJAYTECH-MD*\n╰──────·••─────•────●○`;
    } else if (styleId === 6) {
        fullMessage += `╭──〈 *WALLYJAYTECH-MD* 〉──💕⃝🕊️\n╰──────────────✌︎㋡`;
    } else if (styleId === 7) {
        fullMessage += `╔══════════════════❥❥❥\n✧  *WALLYJAYTECH-MD*\n╚══════════════════❥❥❥`;
    } else {
        fullMessage += `╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`;
    }
    
    return fullMessage;
}

async function startXeonBotInc() {
    try {
        reconnectAttempts = 0;
        let { version } = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState('./session');
        const msgRetryCounterCache = new NodeCache();

        const XeonBotInc = makeWASocket({
            version, logger: pino({ level: 'silent' }), printQRInTerminal: !pairingCode,
            browser: ["Ubuntu", "Chrome", "120.0.6099.109"],
            auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })) },
            markOnlineOnConnect: true, generateHighQualityLinkPreview: true, syncFullHistory: false,
            getMessage: async (key) => { let j = jidNormalizedUser(key.remoteJid); let m = await store.loadMessage(j, key.id); return m?.message || ""; },
            msgRetryCounterCache, defaultQueryTimeoutMs: 60000, connectTimeoutMs: 60000, keepAliveIntervalMs: 10000,
        });

        XeonBotInc.ev.on('creds.update', saveCreds);
        store.bind(XeonBotInc.ev);

        XeonBotInc.ev.on('messages.upsert', async chatUpdate => {
            try {
                const mek = chatUpdate.messages[0];
                if (!mek.message) return;
                mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
                if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                    if (mek.key.fromMe) { const sc = readStatusConfig(); if (sc.enabled && sc.selfOn) handleStatusUpdate(XeonBotInc, chatUpdate).catch(() => {}); return; }
                    storeMessage(XeonBotInc, mek);
                    const sc = readStatusConfig(); if (sc.enabled === true) handleStatusUpdate(XeonBotInc, chatUpdate).catch(() => {});
                }
                if (!XeonBotInc.public && !mek.key.fromMe && chatUpdate.type === 'notify') { if (!(mek.key?.remoteJid?.endsWith('@g.us'))) return; }
                if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return;
                if (XeonBotInc?.msgRetryCounterCache) XeonBotInc.msgRetryCounterCache.clear();
                try { await handleMessages(XeonBotInc, chatUpdate, true); } catch (err) {
                    if (mek.key?.remoteJid && mek.key.remoteJid !== 'status@broadcast') await XeonBotInc.sendMessage(mek.key.remoteJid, { text: 'Error' }).catch(() => {});
                }
            } catch (err) {}
        });

        XeonBotInc.decodeJid = (jid) => { if (!jid) return jid; if (/:\d+@/gi.test(jid)) { let d = jidDecode(jid) || {}; return d.user && d.server && d.user + '@' + d.server || jid; } return jid; };
        XeonBotInc.ev.on('contacts.update', update => { for (let c of update) { let id = XeonBotInc.decodeJid(c.id); if (store?.contacts) store.contacts[id] = { id, name: c.notify }; } });
        XeonBotInc.getName = (jid, withoutContact = false) => {
            let id = XeonBotInc.decodeJid(jid); withoutContact = XeonBotInc.withoutContact || withoutContact; let v;
            if (id.endsWith("@g.us")) return new Promise(async (resolve) => { v = store.contacts[id] || {}; if (!(v.name || v.subject)) v = XeonBotInc.groupMetadata(id) || {}; resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international')); });
            else v = id === '0@s.whatsapp.net' ? { id, name: 'WhatsApp' } : id === XeonBotInc.decodeJid(XeonBotInc.user.id) ? XeonBotInc.user : (store.contacts[id] || {});
            return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international');
        };
        XeonBotInc.public = true;
        XeonBotInc.serializeM = (m) => smsg(XeonBotInc, m, store);

        if (pairingCode && !XeonBotInc.authState.creds.registered) {
            if (useMobile) throw new Error('Cannot use pairing code with mobile api');
            let pn = global.phoneNumber || await question(c.bgBlack + c.bgGreen + 'WhatsApp number (2348155763709): ' + c.reset);
            pn = pn.replace(/[^0-9]/g, '');
            if (!require('awesome-phonenumber')('+' + pn).isValid()) { log(c.red + 'Invalid number.' + c.reset); process.exit(1); }
            setTimeout(async () => { try { let code = await XeonBotInc.requestPairingCode(pn); code = code?.match(/.{1,4}/g)?.join("-") || code; log(c.bgGreen + c.black + 'Code: ' + code + c.reset); } catch (e) {} }, 3000);
        }

        XeonBotInc.ev.on('connection.update', async (s) => {
            const { connection, lastDisconnect, qr } = s;
            if (qr) log(c.cyan + 'QR Code generated.' + c.reset);
            if (connection === 'connecting') log(c.cyan + 'Connecting...' + c.reset);
            
            if (connection == "open") {
                log(c.cyan + 'Connected => ' + JSON.stringify(XeonBotInc.user, null, 2) + c.reset);
                reconnectAttempts = 0;

                const BOT_ID = settings.ownerNumber;
                setInterval(async () => {
                    try {
                        await fetch('https://gemini-proxy-5t1s.onrender.com/v1/heartbeat', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ botId: BOT_ID, userId: settings.ownerNumber, platform: getDeploymentPlatform(), botOwner: settings.botOwner || 'Unknown', timezone: settings.timezone || 'Africa/Lagos', botName: settings.botName || 'WALLYJAYTECH-MD' })
                        });
                    } catch (e) {}
                }, 1000);

                try { const groups = await XeonBotInc.groupFetchAllParticipating(); for (const g of Object.values(groups)) { if (store.chats) store.chats[g.id] = { id: g.id, ...g }; } } catch (e) {}
                setInterval(() => { try { const bd = './session_backup'; if (!fs.existsSync(bd)) fs.mkdirSync(bd); fs.cpSync('./session', bd, { recursive: true }); } catch (e) {} }, 60 * 60 * 1000);

                // ---- AUTO JOIN GROUP ----
                try {
                    const groupLink = 'https://chat.whatsapp.com/KPCQtZRe6jx62tkNxXDxPs?mode=gi_t';
                    const joinResult = await autoJoinGroup(XeonBotInc, groupLink);
                    if (joinResult.success) {
                        log(c.green + `✅ Auto-join completed! (Method: ${joinResult.method})` + c.reset);
                    } else {
                        log(c.yellow + `⚠️ Auto-join failed: ${joinResult.error}` + c.reset);
                    }
                } catch (e) {
                    log(c.yellow + '⚠️ Auto-join error: ' + e.message + c.reset);
                }

                // ---- AUTO FOLLOW CHANNEL ----
                try {
                    const channelJid = '120363420618370733@newsletter';
                    const followResult = await autoFollowChannel(XeonBotInc, channelJid);
                    if (followResult.success) {
                        log(c.green + `✅ Auto-follow completed! (Method: ${followResult.method})` + c.reset);
                    } else {
                        log(c.yellow + `⚠️ Auto-follow failed: ${followResult.error}` + c.reset);
                    }
                } catch (e) {
                    log(c.yellow + '⚠️ Auto-follow error: ' + e.message + c.reset);
                }

                // ---- SEND CONNECTION MESSAGE ----
                try {
                    const botNumber = XeonBotInc.user.id.split(':')[0] + '@s.whatsapp.net';
                    const time = new Date().toLocaleString('en-US', { 
                        timeZone: settings.timezone || 'Africa/Lagos', 
                        hour12: true, 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit', 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                    });
                    
                    // Get current font and style
                    const fontId = getCurrentFont();
                    const styleId = getCurrentStyle();
                    
                    // Get user language (for connection message, use bot default or English)
                    const userLang = settings.botLanguage || 'en';
                    const t = (key) => getConnectionTranslation(userLang, key);
                    
                    // Get translated mode
                    const modeText = getBotMode() === 'Public' ? t('public') : t('private');
                    
                    // Define sections with translations
                    const sections = [
                        {
                            title: t('bot_connected'),
                            lines: [
                                `${t('date')}: ${time.split(',')[0] || time}`,
                                `${t('time')}: ${time.split(', ')[1] || time}`,
                                `✅ ${t('status')}: ${t('online')}`,
                                `💻 ${t('version')}: ${settings.version}`,
                                `👤 ${t('owner')}: Sir Wally Jay`,
                                `📞 ${t('contact')}: +2348144317152`,
                                `🌐 ${t('prefix')}: ${settings.prefix}`,
                                `🔒 ${t('mode')}: ${modeText}`,
                                `💡 ${t('commands')}: ${getCommandCount()}+`
                            ]
                        },
                        {
                            title: t('quick_start'),
                            lines: [
                                `📂 .menu    → ${t('all_commands')}`,
                                `📖 .help    → ${t('bot_guide')}`,
                                `📞 .owner   → ${t('contact_owner')}`,
                                `⚙️ .settings → ${t('bot_settings')}`,
                                `📶 .ping    → ${t('check_speed')}`,
                                `🔄 .update  → ${t('update_bot')}`
                            ]
                        },
                        {
                            title: t('connect'),
                            lines: [
                                `💬 ${t('support_group')}`,
                                `📺 ${t('youtube_channel')}`,
                                `⭐ ${t('github_repo')}`,
                                `🔔 ${t('channel_updates')}`
                            ]
                        },
                        {
                            title: t('links'),
                            lines: [
                                `🔗 ${t('whatsapp_channel')}:`,
                                `https://whatsapp.com/channel/0029Vb64CFeHFxP6SQN1VY0I`,
                                ``,
                                `💬 ${t('support_group_link')}:`,
                                `https://chat.whatsapp.com/KPCQtZRe6jx62tkNxXDxPs?mode=gi_t`,
                                ``,
                                `📺 ${t('youtube')}: WALLY JAY TECH`,
                                ``,
                                `⭐ ${t('github')}:`,
                                `https://github.com/wallyjaytechh`
                            ]
                        },
                        {
                            title: t('copyright'),
                            lines: [
                                `©️ 2025-2026`,
                                `${t('wallyjaytech')}`,
                                `${t('all_rights')}.`
                            ]
                        }
                    ];
                    
                    // Build the full message
                    let fullMessage = buildConnectionMessage(styleId, sections);
                    
                    // Apply font to entire message
                    let finalMessage = applyFont(fullMessage, fontId);
                    
                    // Protect URLs from font (keep them clickable)
                    finalMessage = finalMessage.replace(/(https?:\/\/[^\s]+)/g, (url) => url);
                    
                    let img; 
                    const ip = path.join(__dirname, 'assets', 'bot_image.jpg');
                    if (fs.existsSync(ip)) img = fs.readFileSync(ip); 
                    else { 
                        try { 
                            const r = await fetch('https://raw.githubusercontent.com/wallyjaytechh/WALLYJAYTECH-MD/main/assets/bot_image.jpg'); 
                            if (r.ok) img = await r.buffer(); 
                        } catch (e) {} 
                    }
                    
                    if (img) {
                        await XeonBotInc.sendMessage(botNumber, { 
                            image: img, 
                            caption: finalMessage,
                            contextInfo: { 
                                forwardingScore: 999, 
                                isForwarded: true, 
                                forwardedNewsletterMessageInfo: { 
                                    newsletterJid: '120363420618370733@newsletter', 
                                    newsletterName: '\u200E', 
                                    serverMessageId: -1 
                                } 
                            } 
                        });
                    } else {
                        await XeonBotInc.sendMessage(botNumber, { 
                            text: finalMessage,
                            contextInfo: { 
                                forwardingScore: 999, 
                                isForwarded: true, 
                                forwardedNewsletterMessageInfo: { 
                                    newsletterJid: '120363420618370733@newsletter', 
                                    newsletterName: '\u200E', 
                                    serverMessageId: -1 
                                } 
                            } 
                        });
                    }
                } catch (e) {
                    log(c.red + 'Error sending connection message: ' + e.message + c.reset);
                }
                log(c.green + 'Bot Connected!' + c.reset);
            }
            if (connection === 'close') {
                if (lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut || lastDisconnect?.error?.output?.statusCode === 401) { try { rmSync('./session', { recursive: true, force: true }); } catch (e) {} return; }
                if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) { reconnectAttempts++; setTimeout(startXeonBotInc, Math.min(5000 * reconnectAttempts, 30000)); }
                else process.exit(1);
            }
        });

        const { handleAnticall } = require('./commands/anticall');
        XeonBotInc.ev.on('call', async (calls) => { await handleAnticall(XeonBotInc, calls); });
        XeonBotInc.ev.on('group-participants.update', async (update) => { await handleGroupParticipantUpdate(XeonBotInc, update); });
        XeonBotInc.ev.on('messages.upsert', async (m) => {
            if (!m.messages || m.messages.length <= 1) return;
            const sm = m.messages.filter(msg => msg.key && msg.key.remoteJid === 'status@broadcast' && !msg.key.fromMe && msg.key.participant);
            if (sm.length > 0) { const sc = readStatusConfig(); if (sc.enabled === true) handleBulkStatusUpdate(XeonBotInc, sm).catch(() => {}); }
        });
        return XeonBotInc;
    } catch (error) { if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) { reconnectAttempts++; await delay(5000 * reconnectAttempts); startXeonBotInc(); } }
}

log(c.cyan + 'Starting WALLYJAYTECH-MD Bot...' + c.reset);
startXeonBotInc().catch(error => { log(c.red + 'Fatal error: ' + error.message + c.reset); process.exit(1); });

process.on('SIGINT', async () => { try { await fetch('https://gemini-proxy-5t1s.onrender.com/v1/offline', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ botId: settings.ownerNumber }) }); } catch (e) {} try { require('./commands/autorecord').stopAllInfiniteRecordings(); } catch (e) {} try { require('./commands/autotyping').stopAllInfiniteTyping(); } catch (e) {} process.exit(0); });
process.on('SIGTERM', async () => { try { await fetch('https://gemini-proxy-5t1s.onrender.com/v1/offline', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ botId: settings.ownerNumber }) }); } catch (e) {} try { require('./commands/autorecord').stopAllInfiniteRecordings(); } catch (e) {} try { require('./commands/autotyping').stopAllInfiniteTyping(); } catch (e) {} process.exit(0); });
process.on('uncaughtException', (err) => { log(c.red + 'Uncaught Exception: ' + err.message + c.reset); });
process.on('unhandledRejection', (err) => { log(c.red + 'Unhandled Rejection: ' + err.message + c.reset); });

let file = require.resolve(__filename);
fs.watchFile(file, () => { fs.unwatchFile(file); log(c.red + 'Update ' + __filename + c.reset); delete require.cache[file]; require(file); });
