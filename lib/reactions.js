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

// 400+ emojis for reactions
const reactionEmojis = [
    '👍', '👎', '❤️', '🔥', '🎉', '🙏', '👏', '😊', '😢', '😡', '🤣', '😮', '😍', '😎', '🤔', '😴',
    '💖', '💗', '💓', '💞', '💕', '💘', '💝', '💟', '❣️', '💔', '❤️‍🔥', '❤️‍🩹', '🧡', '💛', '💚', '💙',
    '💜', '🖤', '🤍', '🤎', '💌', '💋', '😄', '😃', '😀', '😁', '😆', '😅', '😂', '🤣', '😇', '🙂',
    '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '🤗', '🤭', '🫢', '🫣', '🤫', '🤔', '🫡',
    '🤐', '🤨', '😐', '😑', '😶', '🫥', '😶‍🌫️', '😏', '😒', '🙄', '😬', '🫨', '🤥', '😪', '😴', '😌',
    '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓',
    '🧐', '😕', '🫤', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '🥹', '😦', '😧', '😨', '😰',
    '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈',
    '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼',
    '😽', '🙀', '😿', '😾', '🙈', '🙉', '🙊', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️',
    '🤞', '🫰', '🤟', '🤘', '🤙', '🫵', '🫴', '👈', '👉', '👆', '🖕', '👇', '☝️', '🫲', '🫱', '✊',
    '👊', '🤛', '🤜', '👏', '🫶', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿',
    '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👄', '👅', '👶', '🧒', '👦', '👧',
    '🧑', '👨', '👩', '🧔', '👴', '👵', '🧓', '👲', '👳', '🧕', '👮', '👷', '💂', '🕵️', '⭐', '🌟',
    '✨', '⚡', '💫', '☄️', '💥', '💢', '❗', '❓', '‼️', '⁉️', '〰️', '💯', '💮', '💌', '🕳️', '🛡️',
    '💈', '🛑', '🔰', '♻️', '⚜️', '🔱', '📛', '💠', '🌀', '💟', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️',
    '☦️', '🛐', '⛎', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷',
    '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇',
    '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🐢', '🐍',
    '🦎', '🐙', '🦑', '🦐', '🦞', '🐠', '🐟', '🐡', '🐬', '🐳', '🐋', '🦈', '🌵', '🎄', '🌲', '🌳',
    '🌴', '🍀', '🌿', '☘️', '🍂', '🍁', '🍃', '🌾', '🌺', '🌻', '🌼', '🌷', '🌸', '💐', '🥀', '🪴',
    '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅',
    '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯',
    '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔',
    '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲',
    '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨',
    '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛',
    '🍼', '🫖', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉',
    '🍾', '🧊', '🥄', '🍴', '🍽️', '🥣', '🥡', '🥢', '🧂', '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐',
    '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣',
    '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸',
    '🤺', '⛹️', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🏆', '🥇', '🥈',
    '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🤹', '🎭', '🎨', '🎬', '🎤', '🎧', '🎷', '🎸',
    '🎹', '🎺', '🎻', '🥁', '🪘', '🪗', '🎮', '🕹️', '🎲', '📱', '📲', '☎️', '📞', '📟', '📠', '🔋',
    '🔌', '💻', '🖥️', '🖨️', '⌨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '🧮', '🎥', '🎞️', '📽️', '📺',
    '📷', '📸', '📹', '📼', '🔍', '🔎', '🕯️', '💡', '🔦', '🏮', '🪔', '📔', '📕', '📖', '📗', '📘',
    '📙', '📚', '📓', '📒', '📃', '📜', '📄', '🗞️', '📰', '🗂️', '📇', '📈', '📉', '📊', '📋', '📁',
    '📂', '🗄️', '📦', '📫', '📪', '📬', '📭', '📮', '✉️', '📧', '📨', '📩', '📤', '📥', '📯', '📢',
    '📣', '🔈', '🔉', '🔊', '🔔', '📯', '🎙️', '🎚️', '🎛️', '📻', '🎧', '🎤', '🎵', '🎶', '🎼', '🎹',
    '🥁', '🪘', '🎷', '🎺', '🪗', '🎸', '🪕', '🎻', '🪈', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩',
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼',
    '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞',
    '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁', '🛶', '⛵',
    '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '🪝', '🚧', '⛽', '🚏', '🚦', '🚥', '🗺️', '🗿', '🛕', '🕍',
    '🕌', '⛪', '🛟', '🎈', '🎉', '🎊', '🎎', '🎏', '🎐', '🎀', '🎁', '🤿', '🪀', '🪅', '🪆', '🧸',
    '🪩', '🪔', '🧧', '💎', '💍', '👑', '👒', '🎩', '🪐', '🌍', '🌎', '🌏', '🌙', '☀️', '🌞', '🌠',
    '☁️', '⛅', '🌤️', '🌥️', '🌦️', '🌧️', '🌨️', '🌩️', '⚡', '❄️', '☃️', '⛄', '☄️', '💫', '🪶', '🕊️',
    '🐉', '🐲', '🦕', '🦖', '🐊', '🦭', '🦧', '🐘', '🦣', '🦏', '🦛', '🐪', '🐫', '🦒', '🦘', '🦬',
    '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛',
    '🪶', '🐓', '🦃', '🦤', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦫', '🦔', '🐿️', '🪵', '🪨', '🪸',
    '🪹', '🪺', '🪴', '🌱', '🌿', '☘️'
];

const USER_GROUP_DATA = path.join(__dirname, '../data/userGroupData.json');

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

function loadAutoReactionState() {
    try {
        if (fs.existsSync(USER_GROUP_DATA)) {
            const data = JSON.parse(fs.readFileSync(USER_GROUP_DATA));
            return data.autoReaction || { ...defaultSettings };
        }
    } catch (error) { console.error('Error loading auto-reaction state:', error); }
    return { ...defaultSettings };
}

function saveAutoReactionState(settings) {
    try {
        const data = fs.existsSync(USER_GROUP_DATA) 
            ? JSON.parse(fs.readFileSync(USER_GROUP_DATA))
            : { groups: [], chatbot: {} };
        data.autoReaction = settings;
        fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2));
    } catch (error) { console.error('Error saving auto-reaction state:', error); }
}

let settings = loadAutoReactionState();

function getRandomEmoji() { return settings.emojiPool[Math.floor(Math.random() * settings.emojiPool.length)]; }
function getReactionEmoji() { return settings.randomMode ? getRandomEmoji() : settings.specificEmoji; }

async function isBotAdminInGroup(sock, chatId) {
    try {
        if (!chatId.endsWith('@g.us')) return false;
        const metadata = await sock.groupMetadata(chatId);
        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const botParticipant = metadata.participants.find(p => p.id === botJid);
        return botParticipant && botParticipant.admin !== null;
    } catch (error) { return false; }
}

async function isGroupLocked(sock, chatId) {
    try {
        if (!chatId.endsWith('@g.us')) return false;
        const metadata = await sock.groupMetadata(chatId);
        return metadata.announce !== false;
    } catch (error) { return false; }
}

// Check if message has ANY content (text, sticker, image, video, audio, etc.)
function hasAnyContent(message) {
    if (!message || !message.message) return false;
    const msg = message.message;
    return !!(
        msg.conversation ||
        msg.extendedTextMessage?.text ||
        msg.imageMessage ||
        msg.videoMessage ||
        msg.audioMessage ||
        msg.stickerMessage ||
        msg.documentMessage ||
        msg.contactMessage ||
        msg.locationMessage ||
        msg.liveLocationMessage ||
        msg.productMessage ||
        msg.buttonsResponseMessage ||
        msg.listResponseMessage ||
        msg.templateButtonReplyMessage ||
        msg.pollCreationMessage ||
        msg.reactionMessage
    );
}

async function shouldReactToMessage(sock, message) {
    if (!settings.enabled) return false;

    const chatId = message.key.remoteJid;
    const senderId = message.key.participant || message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const isSelf = message.key.fromMe;
    const isCommand = message.message?.conversation?.startsWith('.') || 
                     message.message?.extendedTextMessage?.text?.startsWith('.');

    // Check for ANY content type (not just text)
    if (!hasAnyContent(message)) return false;

    if (isGroup && !settings.reactInGroups) return false;
    if (!isGroup && !settings.reactInDMs) return false;

    if (isGroup) {
        const isLocked = await isGroupLocked(sock, chatId);
        const isBotAdmin = await isBotAdminInGroup(sock, chatId);
        
        if (isLocked && !settings.reactInLockedGroups) return false;
        if (isLocked && !isBotAdmin) return false;
    }

    if (isCommand && !settings.reactToCommands) return false;
    if (!isCommand && !isSelf && !settings.reactToOthers) return false;
    if (isSelf && !settings.reactToSelf) return false;

    if (message.message?.protocolMessage) return false;

    return true;
}

// INSTANT reaction - no delay
async function handleAutoreact(sock, message) {
    try {
        const shouldReact = await shouldReactToMessage(sock, message);
        if (!shouldReact) return;
        
        const emoji = getReactionEmoji();
        
        // IMMEDIATE reaction - no setTimeout delay
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
    } catch (error) {
        console.error('Error in handleAutoreact:', error);
    }
}

// Instant command reaction
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

// Handle areact command
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
            const mode = settings.randomMode ? '🎲 Random' : `🎯 Specific (${settings.specificEmoji})';
            
            await sock.sendMessage(chatId, { 
                text: `🎭 *AUTO-REACT SETTINGS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `🎲 *Mode:* ${mode}\n` +
                      `📦 *Emojis:* ${settings.emojiPool.length}+ available\n\n` +
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
                      `└ .areact on/off\n` +
                      `└ .areact random\n` +
                      `└ .areact specific <emoji>\n` +
                      `└ .areact commands on/off\n` +
                      `└ .areact others on/off\n` +
                      `└ .areact self on/off\n` +
                      `└ .areact groups on/off\n` +
                      `└ .areact dms on/off\n` +
                      `└ .areact lockedgroups on/off`,
                ...channelInfo,
                quoted: message
            });
            return;
        }

        // Already set checks for on/off
        if (action === 'on') {
            if (settings.enabled) {
                await sock.sendMessage(chatId, { 
                    text: `⚠️ *ALREADY ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🎭 Auto-React is already *ON*.\n\n💡 Use .areact off to disable.`,
                    ...channelInfo
                });
                return;
            }
            settings.enabled = true;
            saveAutoReactionState(settings);
            await sock.sendMessage(chatId, { 
                text: `✅ *AUTO-REACT ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Bot will now react to messages instantly.\n🎲 Mode: ${settings.randomMode ? 'Random' : 'Specific'}\n💚 ${settings.randomMode ? `${settings.emojiPool.length}+ emojis` : `Using: ${settings.specificEmoji}`}`,
                ...channelInfo
            });
        } else if (action === 'off') {
            if (!settings.enabled) {
                await sock.sendMessage(chatId, { 
                    text: `⚠️ *ALREADY DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🎭 Auto-React is already *OFF*.\n\n💡 Use .areact on to enable.`,
                    ...channelInfo
                });
                return;
            }
            settings.enabled = false;
            saveAutoReactionState(settings);
            await sock.sendMessage(chatId, { 
                text: '❌ *AUTO-REACT DISABLED*',
                ...channelInfo
            });
        } else if (action === 'random') {
            if (settings.randomMode) {
                await sock.sendMessage(chatId, { text: `⚠️ *ALREADY RANDOM*\n\n🎲 Random mode is already *ON*.`, ...channelInfo });
                return;
            }
            settings.randomMode = true;
            saveAutoReactionState(settings);
            await sock.sendMessage(chatId, { 
                text: `🎲 *RANDOM MODE ENABLED*\n\n📌 Bot will react with random emojis.`,
                ...channelInfo
            });
        } else if (action === 'specific') {
            const emoji = args[1];
            if (!emoji) {
                await sock.sendMessage(chatId, { text: `⚠️ Usage: .areact specific <emoji>\nExample: .areact specific ❤️`, ...channelInfo });
                return;
            }
            settings.randomMode = false;
            settings.specificEmoji = emoji;
            saveAutoReactionState(settings);
            await sock.sendMessage(chatId, { text: `🎯 *SPECIFIC REACTION SET*\n\n└ Emoji: ${emoji}`, ...channelInfo });
        } else if (['commands', 'others', 'self', 'groups', 'dms', 'lockedgroups'].includes(action)) {
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
                
                const key = settingMap[action];
                const newState = subAction === 'on';
                
                if (settings[key] === newState) {
                    await sock.sendMessage(chatId, { 
                        text: `⚠️ *ALREADY ${newState ? 'ENABLED' : 'DISABLED'}*\n\n${action} reactions are already *${newState ? 'ON' : 'OFF'}*.\n\n💡 Use .areact ${action} ${newState ? 'off' : 'on'} to change.`,
                        ...channelInfo
                    });
                    return;
                }
                
                settings[key] = newState;
                saveAutoReactionState(settings);
                
                await sock.sendMessage(chatId, { 
                    text: `🎭 *${action.toUpperCase()} REACTIONS ${newState ? 'ENABLED ✅' : 'DISABLED ❌'}*`,
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, { text: `⚠️ Usage: .areact ${action} on/off`, ...channelInfo });
            }
        } else {
            await sock.sendMessage(chatId, { text: `⚠️ Invalid command. Use .areact to see options.`, ...channelInfo });
        }
    } catch (error) {
        console.error('Error handling areact command:', error);
    }
}

module.exports = {
    addCommandReaction,
    handleAreactCommand,
    handleAutoreact
};
