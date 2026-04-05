/**
 * WALLYJAYTECH-MD - Block Command
 */

async function blockCommand(sock, chatId, message) {
    try {
        const userMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const args = userMessage.split(' ').slice(1);
        const isGroup = chatId.endsWith('@g.us');
        
        let targetJid = null;
        let targetNumber = null;

        // If in DM and no arguments, block the current chat user
        if (!isGroup && args.length === 0) {
            targetJid = chatId;
        }
        // Check for mentions in groups
        else if (isGroup) {
            const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            if (mentionedJids.length > 0) {
                targetJid = mentionedJids[0];
            }
        }
        // Check if replying to a message
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            targetJid = message.message.extendedTextMessage.contextInfo.participant;
        }
        // Check for phone number argument
        else if (args.length > 0) {
            let phoneNumber = args[0].replace(/[^0-9]/g, '');
            
            // Remove any leading zeros or extra digits
            if (phoneNumber.startsWith('0')) {
                phoneNumber = phoneNumber.substring(1);
            }
            
            // Validate: Nigerian numbers are 10-13 digits
            if (phoneNumber.length >= 10 && phoneNumber.length <= 13) {
                targetNumber = phoneNumber;
                targetJid = phoneNumber + '@s.whatsapp.net';
            } else {
                return await sock.sendMessage(chatId, {
                    text: `❌ Invalid phone number.\n\nUse format: .block 2348155763709`
                }, { quoted: message });
            }
        }

        if (!targetJid) {
            return await sock.sendMessage(chatId, {
                text: '❌ Please specify a user to block.\n\nExamples:\n.block (in DM to block that user)\n.block @username\n.block 2348155763709'
            }, { quoted: message });
        }

        // Prevent blocking the bot itself
        const botNumber = sock.user.id.split(':')[0];
        if (targetJid.includes(botNumber)) {
            return await sock.sendMessage(chatId, {
                text: '❌ You cannot block the bot itself!'
            }, { quoted: message });
        }

        // Check if it's a LID (cannot block LIDs directly)
        if (targetJid.includes('@lid')) {
            return await sock.sendMessage(chatId, {
                text: `❌ Cannot block LID users directly.\n\nThis user is using WhatsApp's privacy feature. You can only block them if:\n\n1. They message you from their real number\n2. You know their phone number: .block 234XXXXXXXXX\n\nAlternatively, you can ignore their messages.`
            }, { quoted: message });
        }

        console.log(`🔍 Attempting to block: ${targetJid}`);

        // Try to block
        try {
            await sock.updateBlockStatus(targetJid, 'block');
            console.log(`✅ Blocked successfully: ${targetJid}`);
            
            await sock.sendMessage(chatId, {
                text: `✅ Successfully blocked user.\n📱: ${targetNumber || targetJid.split('@')[0]}`
            }, { quoted: message });
            return;
        } catch (err) {
            console.log(`⚠️ Block failed: ${err.message}`);
            
            // Try alternative method
            try {
                await sock.query({
                    tag: 'iq',
                    attrs: {
                        to: 's.whatsapp.net',
                        type: 'set',
                        xmlns: 'block'
                    },
                    content: [
                        {
                            tag: 'block',
                            attrs: {
                                jid: targetJid
                            }
                        }
                    ]
                });
                console.log(`✅ Blocked via query: ${targetJid}`);
                
                await sock.sendMessage(chatId, {
                    text: `✅ Successfully blocked user.`
                }, { quoted: message });
                return;
            } catch (err2) {
                throw new Error('All blocking methods failed');
            }
        }
        
    } catch (error) {
        console.error('Error blocking user:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to block user.\n\nMake sure you have the correct phone number.\nExample: .block 2348155763709'
        }, { quoted: message });
    }
}

module.exports = blockCommand;
