const fs = require('fs');
const path = require('path');

// Channel info for professional branding
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420618370733@newsletter',
            newsletterName: 'WALLYJAYTECH-MD BOTS',
            serverMessageId: -1
        }
    }
};

// EXPANDED list of 400+ emojis for reactions (added 150+ more)
const reactionEmojis = [
    // Common reactions
    '👍', '👎', '❤️', '🔥', '🎉', '🙏', '👏', '😊', '😢', '😡', '🤣', '😮', '😍', '😎', '🤔', '😴',
    
    // Hearts & Love
    '💖', '💗', '💓', '💞', '💕', '💘', '💝', '💟', '❣️', '💔', '❤️‍🔥', '❤️‍🩹', '🧡', '💛', '💚', '💙',
    '💜', '🖤', '🤍', '🤎', '💔', '❤️', '🏳️‍🌈', '🏳️‍⚧️', '💌', '💋',
    
    // Smileys & People
    '😄', '😃', '😀', '😁', '😆', '😅', '😂', '🤣', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘',
    '😗', '😙', '😚', '🤗', '🤭', '🫢', '🫣', '🤫', '🤔', '🫡', '🤐', '🤨', '😐', '😑', '😶', '🫥',
    '😶‍🌫️', '😏', '😒', '🙄', '😬', '🫨', '🤥', '😪', '😴', '😌', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
    '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '🫤', '😟', '🙁', '☹️',
    '😮', '😯', '😲', '😳', '🥺', '🥹', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣',
    '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹',
    '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉',
    '🙊', '💋', '💌', '💘', '💝', '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '💔', '❤️‍🔥', '❤️‍🩹',
    
    // Hands
    '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '🫵', '🫴',
    '👈', '👉', '👆', '🖕', '👇', '☝️', '🫲', '🫱', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🫶',
    '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃',
    '🧠', '🦷', '🦴', '👀', '👁️', '👄', '👅', '👶', '🧒', '👦', '👧', '🧑', '👨', '👩', '🧔', '👴',
    '👵', '🧓', '👲', '👳', '🧕', '👮', '👷', '💂', '🕵️', '👩‍⚕️', '👨‍⚕️', '👩‍🎓', '👨‍🎓', '👩‍🏫', '👨‍🏫', '👩‍⚖️',
    
    // Stars & Symbols
    '⭐', '🌟', '✨', '⚡', '💫', '☄️', '💥', '💢', '❕', '❗', '❔', '❓', '‼️', '⁉️', '〰️', '💤',
    '💭', '💬', '🗨️', '🗯️', '💯', '💢', '♨️', '💮', '💌', '🕳️', '🕶️', '🛡️', '💈', '🛑', '🔰', '♻️',
    '⚜️', '🔱', '📛', '🔰', '💠', '🌀', '💟', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎',
    
    // Animals & Nature
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈',
    '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴',
    '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🐢', '🐍', '🦎', '🐙', '🦑',
    '🦐', '🦞', '🐠', '🐟', '🐡', '🐬', '🐳', '🐋', '🦈', '🌵', '🎄', '🌲', '🌳', '🌴', '🍀', '🌿',
    '☘️', '🍂', '🍁', '🍃', '🌾', '🌺', '🌻', '🌼', '🌷', '🌸', '💐', '🥀', '🪴',
    
    // Food & Drink
    '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅',
    '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯',
    '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔',
    '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲',
    '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨',
    '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛',
    '🍼', '🫖', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉',
    '🍾', '🧊', '🥄', '🍴', '🍽️', '🥣', '🥡', '🥢', '🧂', '💊', '💉', '🩺', '🩹', '🩼', '🦯', '🦻',
    
    // Activities & Sports
    '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍',
    '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌',
    '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺', '⛹️', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽',
    '🚣', '🧗', '🚵', '🚴', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🤹',
    '🎭', '🎨', '🎬', '🎤', '🎧', '🎷', '🎸', '🎹', '🎺', '🎻', '🥁', '🪘', '🪗', '🎮', '🕹️', '🎲',
    
    // Flags
    '🏳️', '🏴', '🏁', '🚩', '🎌', '🏴‍☠️', '🇦🇫', '🇦🇽', '🇦🇱', '🇩🇿', '🇦🇸', '🇦🇩', '🇦🇴', '🇦🇮', '🇦🇶', '🇦🇬',
    '🇦🇷', '🇦🇲', '🇦🇼', '🇦🇺', '🇦🇹', '🇦🇿', '🇧🇸', '🇧🇭', '🇧🇩', '🇧🇧', '🇧🇾', '🇧🇪', '🇧🇿', '🇧🇯', '🇧🇲', '🇧🇹',
    
    // Objects
    '📱', '📲', '☎️', '📞', '📟', '📠', '🔋', '🔌', '💻', '🖥️', '🖨️', '⌨️', '🖱️', '🖲️', '💽', '💾',
    '💿', '📀', '🧮', '🎥', '🎞️', '📽️', '🎬', '📺', '📷', '📸', '📹', '📼', '🔍', '🔎', '🕯️', '💡',
    '🔦', '🏮', '🪔', '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📓', '📒', '📃', '📜', '📄', '🗞️',
    '📰', '🗂️', '📇', '📈', '📉', '📊', '📋', '📁', '📂', '🗄️', '📦', '📫', '📪', '📬', '📭', '📮',
    '✉️', '📧', '📨', '📩', '📤', '📥', '📯', '📢', '📣', '🔈', '🔉', '🔊', '🔔', '📯', '🎙️', '🎚️',
    '🎛️', '📻', '🎧', '🎤', '🎵', '🎶', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🪗', '🎸', '🪕', '🎻',
    '🪈', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩', '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑',
    '🚒', '🚐', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍',
    '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬',
    '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '🪝', '🚧',
    '⛽', '🚏', '🚦', '🚥', '🗺️', '🗿', '🛕', '🕍', '🕌', '⛪', '🛟', '🎈', '🎉', '🎊', '🎎', '🎏',
    '🎐', '🎀', '🎁', '🤿', '🪀', '🪅', '🪆', '🧸', '🪩', '🪔', '🧧', '💎', '💍', '👑', '👒', '🎩',
    
    // More NEW emojis (extra 100+)
    '🪐', '🌍', '🌎', '🌏', '🌙', '☀️', '🌞', '⭐', '🌟', '🌠', '☁️', '⛅', '🌤️', '🌥️', '🌦️', '🌧️',
    '🌨️', '🌩️', '⚡', '❄️', '☃️', '⛄', '☄️', '💫', '🪶', '🕊️', '🐉', '🐲', '🦕', '🦖', '🐊', '🦭',
    '🦧', '🐘', '🦣', '🦏', '🦛', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏',
    '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🪶', '🐓', '🦃', '🦤', '🦚', '🦜',
    '🦢', '🦩', '🕊️', '🐇', '🦫', '🦔', '🐿️', '🪵', '🪨', '🪸', '🪹', '🪺', '🪴', '🌱', '🌿', '☘️'
];

// Path for storing auto-reaction state
const USER_GROUP_DATA = path.join(__dirname, '../data/userGroupData.json');

// Default settings
const defaultSettings = {
    enabled: false,
    reactToCommands: true,
    reactToOthers: true,
    reactToSelf: true,
    reactInGroups: true,
    reactInDMs: true,
    reactInLockedGroups: true,
    randomMode: true,
    specificEmoji: '💊',
    emojiPool: reactionEmojis
};

// Load auto-reaction state from file
function loadAutoReactionState() {
    try {
        if (fs.existsSync(USER_GROUP_DATA)) {
            const data = JSON.parse(fs.readFileSync(USER_GROUP_DATA));
            return data.autoReaction || { ...defaultSettings };
        }
    } catch (error) {
        console.error('Error loading auto-reaction state:', error);
    }
    return { ...defaultSettings };
}

// Save auto-reaction state to file
function saveAutoReactionState(settings) {
    try {
        const data = fs.existsSync(USER_GROUP_DATA) 
            ? JSON.parse(fs.readFileSync(USER_GROUP_DATA))
            : { groups: [], chatbot: {} };
        
        data.autoReaction = settings;
        fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving auto-reaction state:', error);
    }
}

// Load settings
let settings = loadAutoReactionState();

function getRandomEmoji() {
    return settings.emojiPool[Math.floor(Math.random() * settings.emojiPool.length)];
}

function getReactionEmoji() {
    return settings.randomMode ? getRandomEmoji() : settings.specificEmoji;
}

// Function to check if bot is admin in group
async function isBotAdminInGroup(sock, chatId) {
    try {
        if (!chatId.endsWith('@g.us')) return false;
        
        const metadata = await sock.groupMetadata(chatId);
        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        const botParticipant = metadata.participants.find(p => p.id === botJid);
        return botParticipant && botParticipant.admin !== null;
    } catch (error) {
        console.error('Error checking bot admin status:', error);
        return false;
    }
}

// Function to check if group is locked
async function isGroupLocked(sock, chatId) {
    try {
        if (!chatId.endsWith('@g.us')) return false;
        
        const metadata = await sock.groupMetadata(chatId);
        return metadata.announce !== false;
    } catch (error) {
        console.error('Error checking group lock status:', error);
        return false;
    }
}

// Check if we should react to this message
async function shouldReactToMessage(sock, message) {
    if (!settings.enabled) return false;

    const chatId = message.key.remoteJid;
    const senderId = message.key.participant || message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const isBot = senderId.includes(sock.user.id.split(':')[0]);
    const isSelf = message.key.fromMe;
    const isCommand = message.message?.conversation?.startsWith('.') || 
                     message.message?.extendedTextMessage?.text?.startsWith('.');

    if (isGroup && !settings.reactInGroups) return false;
    if (!isGroup && !settings.reactInDMs) return false;

    if (isGroup) {
        const isLocked = await isGroupLocked(sock, chatId);
        const isBotAdmin = await isBotAdminInGroup(sock, chatId);
        
        if (isLocked && !settings.reactInLockedGroups) {
            console.log(`🔒 Skipping reaction in locked group: ${chatId}`);
            return false;
        }
        
        if (isLocked && !isBotAdmin) {
            console.log(`⚠️ Bot not admin in locked group, cannot react: ${chatId}`);
            return false;
        }
    }

    if (isCommand && !settings.reactToCommands) return false;
    if (!isCommand && !isSelf && !settings.reactToOthers) return false;
    if (isSelf && !settings.reactToSelf) return false;

    if (message.message?.protocolMessage) return false;
    if (!message.message?.conversation && !message.message?.extendedTextMessage?.text) return false;

    return true;
}

// Function to add reaction to ANY message
async function handleAutoreact(sock, message) {
    try {
        const shouldReact = await shouldReactToMessage(sock, message);
        if (!shouldReact) return;
        
        const emoji = getReactionEmoji();
        
        const delay = Math.floor(Math.random() * 2000) + 1000;
        
        setTimeout(async () => {
            try {
                await sock.sendMessage(message.key.remoteJid, {
                    react: {
                        text: emoji,
                        key: message.key
                    }
                });
                
                const chatType = message.key.remoteJid.endsWith('@g.us') ? 'group' : 'DM';
                console.log(`✅ Auto-reacted with ${emoji} in ${chatType}`);
            } catch (error) {
                console.error('Error adding auto-reaction:', error);
            }
        }, delay);
    } catch (error) {
        console.error('Error in handleAutoreact:', error);
    }
}

// Function to add reaction to command messages
async function addCommandReaction(sock, message) {
    try {
        const shouldReact = await shouldReactToMessage(sock, message);
        if (!shouldReact || !message?.key?.id) return;
        
        const emoji = getReactionEmoji();
        await sock.sendMessage(message.key.remoteJid, {
            react: {
                text: emoji,
                key: message.key
            }
        });
    } catch (error) {
        console.error('Error adding command reaction:', error);
    }
}

// Updated function to handle areact command with professional layout
async function handleAreactCommand(sock, chatId, message, isOwner) {
    try {
        if (!isOwner) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command is only available for the owner!',
                ...channelInfo,
                quoted: message
            });
            return;
        }

        const userMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const args = userMessage.split(' ').slice(1);
        const action = args[0]?.toLowerCase();

        if (!action) {
            const status = settings.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = settings.enabled ? '🟢' : '🔴';
            const mode = settings.randomMode ? '🎲 Random' : `🎯 Specific (${settings.specificEmoji})`;
            const emojiCount = settings.emojiPool.length;
            
            await sock.sendMessage(chatId, { 
                text: `🎭 *AUTO-REACT SETTINGS* 🎭\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `🎲 *Mode:* ${mode}\n` +
                      `📦 *Emojis:* ${emojiCount}+ available\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📊 *React to:*\n` +
                      `└ Commands: ${settings.reactToCommands ? '✅' : '❌'}\n` +
                      `└ Others: ${settings.reactToOthers ? '✅' : '❌'}\n` +
                      `└ Self: ${settings.reactToSelf ? '✅' : '❌'}\n` +
                      `└ Groups: ${settings.reactInGroups ? '✅' : '❌'}\n` +
                      `└ DMs: ${settings.reactInDMs ? '✅' : '❌'}\n` +
                      `└ Locked Groups: ${settings.reactInLockedGroups ? '✅' : '❌'}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .areact on/off - Enable/disable\n` +
                      `└ .areact random - Random mode\n` +
                      `└ .areact specific <emoji> - Set specific emoji\n` +
                      `└ .areact commands on/off - Toggle command reactions\n` +
                      `└ .areact others on/off - Toggle others' messages\n` +
                      `└ .areact self on/off - Toggle self messages\n` +
                      `└ .areact groups on/off - Toggle groups\n` +
                      `└ .areact dms on/off - Toggle DMs\n` +
                      `└ .areact lockedgroups on/off - Toggle locked groups\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Example:*\n` +
                      `└ .areact specific ❤️\n` +
                      `└ .areact groups off`,
                ...channelInfo,
                quoted: message
            });
            return;
        }

        if (action === 'on') {
            settings.enabled = true;
            saveAutoReactionState(settings);
            await sock.sendMessage(chatId, { 
                text: `✅ *AUTO-REACT ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Bot will now react to messages automatically.\n🎲 Mode: ${settings.randomMode ? 'Random' : 'Specific'}\n💚 ${settings.randomMode ? `${settings.emojiPool.length}+ emojis available` : `Using: ${settings.specificEmoji}`}`,
                ...channelInfo,
                quoted: message
            });
        } 
        else if (action === 'off') {
            settings.enabled = false;
            saveAutoReactionState(settings);
            await sock.sendMessage(chatId, { 
                text: '❌ *AUTO-REACT DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\nBot will no longer react to messages.',
                ...channelInfo,
                quoted: message
            });
        }
        else if (action === 'random') {
            settings.randomMode = true;
            saveAutoReactionState(settings);
            await sock.sendMessage(chatId, { 
                text: `🎲 *RANDOM MODE ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Bot will react with random emojis from ${settings.emojiPool.length}+ options.\n\n✨ *Examples:*\n└ ${getRandomEmoji()} ${getRandomEmoji()} ${getRandomEmoji()}`,
                ...channelInfo,
                quoted: message
            });
        }
        else if (action === 'specific') {
            const emoji = args[1];
            if (!emoji) {
                await sock.sendMessage(chatId, { 
                    text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .areact specific <emoji>\n\n✨ *Example:*\n└ .areact specific ❤️\n└ .areact specific 👍`,
                    ...channelInfo,
                    quoted: message
                });
                return;
            }
            settings.randomMode = false;
            settings.specificEmoji = emoji;
            saveAutoReactionState(settings);
            await sock.sendMessage(chatId, { 
                text: `🎯 *SPECIFIC REACTION SET*\n\n━━━━━━━━━━━━━━━━━━━━\n└ Emoji: ${emoji}\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Bot will now react with ${emoji} to all messages.`,
                ...channelInfo,
                quoted: message
            });
        }
        else if (['commands', 'others', 'self', 'groups', 'dms', 'lockedgroups'].includes(action)) {
            const subAction = args[1]?.toLowerCase();
            if (subAction === 'on' || subAction === 'off') {
                const settingMap = {
                    'commands': 'reactToCommands',
                    'others': 'reactToOthers', 
                    'self': 'reactToSelf',
                    'groups': 'reactInGroups',
                    'dms': 'reactInDMs',
                    'lockedgroups': 'reactInLockedGroups'
                };
                
                settings[settingMap[action]] = subAction === 'on';
                saveAutoReactionState(settings);
                
                const statusText = subAction === 'on' ? 'ENABLED ✅' : 'DISABLED ❌';
                await sock.sendMessage(chatId, { 
                    text: `🎭 *${action.toUpperCase()} REACTIONS ${statusText}*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Bot will ${subAction === 'on' ? 'now' : 'no longer'} react to ${action} messages.`,
                    ...channelInfo,
                    quoted: message
                });
            } else {
                await sock.sendMessage(chatId, { 
                    text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .areact ${action} on/off\n\n✨ *Example:*\n└ .areact ${action} on\n└ .areact ${action} off`,
                    ...channelInfo,
                    quoted: message
                });
            }
        }
        else {
            await sock.sendMessage(chatId, { 
                text: `⚠️ *INVALID COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 Use .areact to see all available options.\n\n✨ *Examples:*\n└ .areact on\n└ .areact random\n└ .areact specific ❤️`,
                ...channelInfo,
                quoted: message
            });
        }
    } catch (error) {
        console.error('Error handling areact command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error controlling auto-reactions',
            ...channelInfo,
            quoted: message
        });
    }
}

module.exports = {
    addCommandReaction,
    handleAreactCommand,
    handleAutoreact
};
