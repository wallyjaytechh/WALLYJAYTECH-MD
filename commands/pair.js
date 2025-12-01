const sessionManager = require('../lib/sessionManager');
const { isOwner } = require('../lib/isOwner');

async function pairCommand(sock, chatId, message, userMessage) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const args = userMessage.split(' ').slice(1);
        const subCommand = args[0]?.toLowerCase();
        const isUserOwner = await isOwner(senderId, sock, chatId);

        if (isUserOwner) {
            // OWNER COMMANDS
            switch (subCommand) {
                case 'add':
                    if (args.length < 2) {
                        return await sock.sendMessage(chatId, { 
                            text: 'Usage: .pair add <number>\nExample: .pair add 2348155763709'
                        }, { quoted: message });
                    }
                    
                    let number = args[1].replace(/[^0-9]/g, '');
                    if (!number.startsWith('234')) number = '234' + number;
                    const userJid = number + '@s.whatsapp.net';
                    
                    // Generate pair code for this user
                    const pairCode = sessionManager.generatePairCode(userJid);
                    const info = sessionManager.getSessionInfo();
                    
                    await sock.sendMessage(chatId, { 
                        text: `🔐 *PAIRING CODE GENERATED*\n\n👤 For: ${userJid}\n📟 Code: *${pairCode}*\n⏰ Expires: 10 minutes\n\nSend this to the user. They need to:\n1. Add this bot number\n2. Use: .link ${pairCode}\n3. Scan QR code when prompted\n\n📊 Available slots: ${info.availableSlots}`
                    }, { quoted: message });
                    break;

                case 'remove':
                    if (args.length < 2) {
                        return await sock.sendMessage(chatId, { 
                            text: 'Usage: .pair remove <number>\nExample: .pair remove 2348155763709'
                        }, { quoted: message });
                    }
                    
                    let removeNumber = args[1].replace(/[^0-9]/g, '');
                    if (!removeNumber.startsWith('234')) removeNumber = '234' + removeNumber;
                    const removeJid = removeNumber + '@s.whatsapp.net';
                    
                    const result = sessionManager.removeUserSession(removeJid);
                    await sock.sendMessage(chatId, { text: result.message }, { quoted: message });
                    break;

                case 'list':
                    const sessionInfo = sessionManager.getSessionInfo();
                    let listText = `📱 *ACTIVE SESSIONS*\n\n`;
                    listText += `👑 Owner: ${sessionInfo.owner || 'Not set'}\n`;
                    listText += `👥 Users: ${sessionInfo.users.length}/${sessionInfo.totalSlots - 1}\n`;
                    listText += `🔄 Available: ${sessionInfo.availableSlots}\n\n`;
                    
                    if (sessionInfo.users.length > 0) {
                        listText += `**Active Users:**\n`;
                        sessionInfo.users.forEach((user, index) => {
                            listText += `${index + 1}. ${user}\n`;
                        });
                    } else {
                        listText += `No active user sessions.`;
                    }
                    
                    await sock.sendMessage(chatId, { text: listText }, { quoted: message });
                    break;

                default:
                    const info = sessionManager.getSessionInfo();
                    const helpText = `👑 *SESSION MANAGEMENT*\n\n` +
                                   `.pair add <number> - Generate pair code for user\n` +
                                   `.pair remove <number> - Remove user session\n` +
                                   `.pair list - Show all active sessions\n\n` +
                                   `📊 Status: ${info.usedSlots}/${info.totalSlots} slots used\n` +
                                   `🔄 Available: ${info.availableSlots} slots free`;
                    
                    await sock.sendMessage(chatId, { text: helpText }, { quoted: message });
                    break;
            }
        } else {
            // USER COMMANDS
            if (sessionManager.hasSession(senderId)) {
                await sock.sendMessage(chatId, { 
                    text: `✅ You have an active session!\n\nYour WhatsApp is linked to this bot.\nYou can use all commands in any chat.`
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, { 
                    text: `❌ No active session found.\n\nYou need a pairing code from the owner to link your WhatsApp.\n\nContact owner to get a pairing code.`
                }, { quoted: message });
            }
        }
    } catch (error) {
        console.error('Error in pair command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error processing pair command.'
        }, { quoted: message });
    }
}

module.exports = {
    command: pairCommand,
    sessionManager: sessionManager
};
