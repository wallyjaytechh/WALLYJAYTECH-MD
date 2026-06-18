const fs = require('fs');
const path = require('path');

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

const reactionEmojis = [
    '👍', '👎', '❤️', '🔥', '🎉', '🙏', '👏', '😊', '😢', '😡', '🤣', '😮', '😍', '😎', '🤔', '😴',
    '💖', '💗', '💓', '💞', '💕', '💘', '💝', '💟', '❣️', '💔', '❤️‍🔥', '❤️‍🩹', '🧡', '💛', '💚', '💙',
    '💜', '🖤', '🤍', '🤎', '💌', '💋', '😄', '😃', '😀', '😁', '😆', '😅', '😂', '🤣', '😇', '🙂',
    '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '🤗', '🤭', '🫢', '🫣', '🤫', '🤔', '🫡',
    '🤐', '🤨', '😐', '😑', '😶', '🫥', '😏', '😒', '🙄', '😬', '🤥', '😪', '😴', '😌', '😷', '🤒',
    '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕',
    '😮', '😯', '😲', '😳', '🥺', '🥹', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣',
    '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹',
    '👺', '👻', '👽', '👾', '🤖', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰',
    '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '✊', '👊', '🤛', '🤜', '👏', '🫶', '🙌',
    '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '👀', '👁️', '👄', '👅', '🧠', '🦷',
    '⭐', '🌟', '✨', '⚡', '💫', '💥', '💢', '❗', '❓', '‼️', '⁉️', '💯', '💮', '🛑', '🔰', '♻️',
    '⚜️', '🔱', '💠', '🌀', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮',
    '🐷', '🐸', '🐵', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗',
    '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🐢', '🐍', '🦎', '🐙', '🦑', '🐠', '🐟', '🐡',
    '🐬', '🐳', '🐋', '🦈', '🌵', '🎄', '🌲', '🌳', '🌴', '🍀', '🌿', '☘️', '🌺', '🌻', '🌼', '🌷',
    '🌸', '💐', '🥀', '🪴', '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥭', '🍍', '🥥',
    '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯',
    '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕',
    '🥪', '🥙', '🌮', '🌯', '🥗', '🥘', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙', '🍚',
    '🍘', '🍥', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿',
    '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🍵', '🧃', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷',
    '🥃', '🍸', '🍹', '🍾', '🧊', '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸',
    '🏒', '🏏', '🥅', '⛳', '🪁', '🏹', '🎣', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '🎿', '🏂', '🪂',
    '🏋️', '🤼', '🤸', '🤺', '🏌️', '🏇', '🧘', '🏄', '🏊', '🚣', '🧗', '🚵', '🚴', '🏆', '🥇', '🥈',
    '🥉', '🏅', '🎖️', '🎗️', '🎫', '🎟️', '🎪', '🤹', '🎭', '🎨', '🎬', '🎤', '🎧', '🎷', '🎸', '🎹',
    '🎺', '🎻', '🥁', '🎮', '🕹️', '🎲', '📱', '💻', '🖥️', '⌨️', '💽', '💾', '💿', '📀', '🎥', '📺',
    '📷', '📸', '📹', '🔍', '🔎', '💡', '🔦', '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📓', '📒',
    '📰', '📊', '📋', '📁', '📂', '📦', '📫', '📬', '📭', '📮', '✉️', '📧', '📨', '📩', '📤', '📥',
    '📢', '📣', '🔈', '🔉', '🔊', '🔔', '🎵', '🎶', '🎼', '🚗', '🚕', '🚙', '🚌', '🚎', '🚓', '🚑',
    '🚒', '🚐', '🚚', '🚛', '🚜', '🚲', '🛵', '🏍️', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟',
    '🚃', '🚋', '🚞', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸',
    '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '🚢', '⚓', '🚧', '⛽', '🚏', '🚦', '🚥', '🗺️', '🗿', '🎈',
    '🎉', '🎊', '🎎', '🎏', '🎐', '🎀', '🎁', '🧸', '💎', '💍', '👑', '👒', '🎩', '🪐', '🌍', '🌎',
    '🌏', '🌙', '☀️', '🌞', '🌠', '☁️', '⛅', '🌈', '🌧️', '🌨️', '⚡', '❄️', '☃️', '⛄', '🪶', '🕊️',
    '🐉', '🐲', '🦕', '🦖', '🐊', '🦭', '🐘', '🦣', '🦏', '🦛', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂',
    '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜',
    '🦢', '🦩', '🐇', '🦫', '🦔', '🐿️', '🪵', '🪨', '🪸', '🌱', '🌿', '☘️'
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

function hasAnyContent(message) {
    if (!message || !message.message) return false;
    const msg = message.message;
    return !!(msg.conversation || msg.extendedTextMessage?.text || msg.imageMessage || msg.videoMessage || 
              msg.audioMessage || msg.stickerMessage || msg.documentMessage || msg.contactMessage ||
              msg.locationMessage || msg.buttonsResponseMessage || msg.listResponseMessage || msg.reactionMessage);
}

async function shouldReactToMessage(sock, message) {
    if (!settings.enabled) return false;
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const isSelf = message.key.fromMe;
    const isCommand = message.message?.conversation?.startsWith('.') || message.message?.extendedTextMessage?.text?.startsWith('.');
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

async function handleAutoreact(sock, message) {
    try {
        const shouldReact = await shouldReactToMessage(sock, message);
        if (!shouldReact) return;
        const emoji = getReactionEmoji();
        try {
            await sock.sendMessage(message.key.remoteJid, { react: { text: emoji, key: message.key } });
        } catch (error) { console.error('Error adding auto-reaction:', error); }
    } catch (error) { console.error('Error in handleAutoreact:', error); }
}

async function addCommandReaction(sock, message) {
    try {
        const shouldReact = await shouldReactToMessage(sock, message);
        if (!shouldReact || !message?.key?.id) return;
        const emoji = getReactionEmoji();
        await sock.sendMessage(message.key.remoteJid, { react: { text: emoji, key: message.key } });
    } catch (error) { console.error('Error adding command reaction:', error); }
}

async function handleAreactCommand(sock, chatId, message, isOwner) {
    try {
        if (!isOwner) {
            await sock.sendMessage(chatId, { text: '❌ This command is only available for the owner!', ...channelInfo });
            return;
        }

        const userMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const args = userMessage.split(' ').slice(1);
        const action = args[0]?.toLowerCase();

        if (!action) {
            const status = settings.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = settings.enabled ? '🟢' : '🔴';
            const mode = settings.randomMode ? '🎲 Random' : `🎯 Specific (${settings.specificEmoji})`;
            
            await sock.sendMessage(chatId, { 
                text: `🎭 *AUTO-REACT SETTINGS*\n\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🎲 *Mode:* ${mode}\n` +
                      `📦 *Emoji Pool:* ${settings.emojiPool.length}+ available\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📊 *React To:*\n` +
                      `└ Commands: ${settings.reactToCommands ? '✅' : '❌'}\n` +
                      `└ Others: ${settings.reactToOthers ? '✅' : '❌'}\n` +
                      `└ Self: ${settings.reactToSelf ? '✅' : '❌'}\n` +
                      `└ Groups: ${settings.reactInGroups ? '✅' : '❌'}\n` +
                      `└ DMs: ${settings.reactInDMs ? '✅' : '❌'}\n` +
                      `└ Locked Groups: ${settings.reactInLockedGroups ? '✅' : '❌'}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .areact on/off - Enable/disable\n` +
                      `└ .areact random - Random emoji mode\n` +
                      `└ .areact specific <emoji> - Set fixed emoji\n` +
                      `└ .areact commands on/off - Toggle commands\n` +
                      `└ .areact others on/off - Toggle others\n` +
                      `└ .areact self on/off - Toggle self\n` +
                      `└ .areact groups on/off - Toggle groups\n` +
                      `└ .areact dms on/off - Toggle DMs\n` +
                      `└ .areact lockedgroups on/off - Toggle locked groups\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Examples:*\n` +
                      `└ .areact specific ❤️\n` +
                      `└ .areact groups off\n` +
                      `└ .areact self off`,
                ...channelInfo
            });
            return;
        }

        if (action === 'on') {
            if (settings.enabled) {
                await sock.sendMessage(chatId, { text: `⚠️ *ALREADY ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🎭 Auto-React is already *ON*.\n\n💡 Use .areact off to disable.`, ...channelInfo });
                return;
            }
            settings.enabled = true;
            saveAutoReactionState(settings);
            await sock.sendMessage(chatId, { 
                text: `✅ *AUTO-REACT ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Bot will now react to messages instantly.\n🎲 Mode: ${settings.randomMode ? 'Random' : 'Specific'}\n💚 ${settings.randomMode ? `${settings.emojiPool.length}+ emojis available` : `Using: ${settings.specificEmoji}`}`,
                ...channelInfo
            });
        } else if (action === 'off') {
            if (!settings.enabled) {
                await sock.sendMessage(chatId, { text: `⚠️ *ALREADY DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🎭 Auto-React is already *OFF*.\n\n💡 Use .areact on to enable.`, ...channelInfo });
                return;
            }
            settings.enabled = false;
            saveAutoReactionState(settings);
            await sock.sendMessage(chatId, { text: `❌ *AUTO-REACT DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Bot will no longer react to messages.\n\n💡 Use .areact on to enable.`, ...channelInfo });
        } else if (action === 'random') {
            if (settings.randomMode) {
                await sock.sendMessage(chatId, { text: `⚠️ *ALREADY RANDOM*\n\n━━━━━━━━━━━━━━━━━━━━\n🎲 Random mode is already *ON*.\n\n💡 Use .areact specific <emoji> to change.`, ...channelInfo });
                return;
            }
            settings.randomMode = true;
            saveAutoReactionState(settings);
            await sock.sendMessage(chatId, { text: `🎲 *RANDOM MODE ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Bot will react with random emojis from ${settings.emojiPool.length}+ options.\n\n✨ *Sample:* ${getRandomEmoji()} ${getRandomEmoji()} ${getRandomEmoji()}`, ...channelInfo });
        } else if (action === 'specific') {
            const emoji = args[1];
            if (!emoji) {
                await sock.sendMessage(chatId, { text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .areact specific <emoji>\n\n✨ *Example:*\n└ .areact specific ❤️\n└ .areact specific 👍`, ...channelInfo });
                return;
            }
            settings.randomMode = false;
            settings.specificEmoji = emoji;
            saveAutoReactionState(settings);
            await sock.sendMessage(chatId, { text: `🎯 *SPECIFIC REACTION SET*\n\n━━━━━━━━━━━━━━━━━━━━\n└ Emoji: ${emoji}\n\n📌 Bot will now react with ${emoji} to all messages.`, ...channelInfo });
        } else if (['commands', 'others', 'self', 'groups', 'dms', 'lockedgroups'].includes(action)) {
            const subAction = args[1]?.toLowerCase();
            if (subAction === 'on' || subAction === 'off') {
                const settingMap = {
                    'commands': 'reactToCommands', 'others': 'reactToOthers', 'self': 'reactToSelf',
                    'groups': 'reactInGroups', 'dms': 'reactInDMs', 'lockedgroups': 'reactInLockedGroups'
                };
                const key = settingMap[action];
                const newState = subAction === 'on';
                
                if (settings[key] === newState) {
                    await sock.sendMessage(chatId, { 
                        text: `⚠️ *ALREADY ${newState ? 'ENABLED' : 'DISABLED'}*\n\n━━━━━━━━━━━━━━━━━━━━\n🎭 ${action} reactions are already *${newState ? 'ON' : 'OFF'}*.\n\n💡 Use .areact ${action} ${newState ? 'off' : 'on'} to change.`,
                        ...channelInfo
                    });
                    return;
                }
                settings[key] = newState;
                saveAutoReactionState(settings);
                await sock.sendMessage(chatId, { 
                    text: `🎭 *${action.toUpperCase()} REACTIONS ${newState ? 'ENABLED ✅' : 'DISABLED ❌'}*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Bot will ${newState ? 'now' : 'no longer'} react to ${action} messages.`,
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, { text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .areact ${action} on/off\n\n✨ *Example:*\n└ .areact ${action} on\n└ .areact ${action} off`, ...channelInfo });
            }
        } else {
            await sock.sendMessage(chatId, { 
                text: `⚠️ *INVALID COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 Use .areact to see all available options.\n\n✨ *Examples:*\n└ .areact on\n└ .areact random\n└ .areact specific ❤️\n└ .areact self off`,
                ...channelInfo
            });
        }
    } catch (error) { console.error('Error handling areact command:', error); }
}

module.exports = { addCommandReaction, handleAreactCommand, handleAutoreact };
