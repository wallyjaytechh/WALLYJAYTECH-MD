/**
 * WALLYJAYTECH-MD - Block Command (Working with LIDs)
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
            
            if (phoneNumber.length === 10) {
                phoneNumber = '234' + phoneNumber;
            }
            
            if (phoneNumber.length >= 10 && phoneNumber.length <= 13) {
                targetNumber = phoneNumber;
                targetJid = phoneNumber + '@s.whatsapp.net';
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

        console.log(`🔍 Attempting to block: ${targetJid}`);
        
        // Try to get real phone number from LID
        let realJid = targetJid;
        let realNumber = targetNumber;
        
        // If it's a LID, try to extract or get the real number
        if (targetJid.includes('@lid')) {
            console.log(`🔄 LID detected, attempting to resolve...`);
            
            // Method 1: Try to get from message history
            try {
                // Get chat messages to find real number
                const messages = await sock.loadMessages(targetJid, 5);
                for (const msg of messages) {
                    if (msg.key && msg.key.remoteJid && !msg.key.remoteJid.includes('@lid')) {
                        realJid = msg.key.remoteJid;
                        realNumber = realJid.split('@')[0];
                        console.log(`✅ Found real JID from message: ${realJid}`);
                        break;
                    }
                }
            } catch (err) {
                console.log(`⚠️ Could not get messages: ${err.message}`);
            }
            
            // Method 2: Try to extract phone number from LID string
            if (realJid.includes('@lid')) {
                const lidNumber = targetJid.split('@')[0];
                // LIDs often contain the phone number
                if (lidNumber.length >= 10 && lidNumber.length <= 13) {
                    realNumber = lidNumber;
                    realJid = realNumber + '@s.whatsapp.net';
                    console.log(`✅ Extracted phone from LID: ${realNumber}`);
                }
            }
        }
        
        // Try to block using the real JID
        if (realJid && !realJid.includes('@lid')) {
            console.log(`🔒 Attempting to block: ${realJid}`);
            
            try {
                await sock.updateBlockStatus(realJid, 'block');
                console.log(`✅ Blocked successfully: ${realJid}`);
                
                await sock.sendMessage(chatId, {
                    text: `✅ Successfully blocked user.\n📱: ${realNumber || realJid.split('@')[0]}`
                }, { quoted: message });
                return;
            } catch (err) {
                console.log(`⚠️ Block failed: ${err.message}`);
            }
        }
        
        // Method 3: Try using onWhatsApp to get JID
        if (realNumber) {
            try {
                const result = await sock.onWhatsApp(realNumber);
                if (result && result[0] && result[0].jid) {
                    const jid = result[0].jid;
                    console.log(`📱 Found JID via onWhatsApp: ${jid}`);
                    await sock.updateBlockStatus(jid, 'block');
                    console.log(`✅ Blocked via onWhatsApp: ${jid}`);
                    
                    await sock.sendMessage(chatId, {
                        text: `✅ Successfully blocked user.\n📱: ${realNumber}`
                    }, { quoted: message });
                    return;
                }
            } catch (err) {
                console.log(`⚠️ onWhatsApp failed: ${err.message}`);
            }
        }
        
        // If all else fails, show instructions
        await sock.sendMessage(chatId, {
            text: `❌ Cannot block LID user directly.\n\nTo block this user:\n1. Ask them to message you first\n2. Then use: .block ${realNumber || 'their phone number'}\n\nOr use their phone number if you know it:\n.block 234XXXXXXXXX`
        }, { quoted: message });
        
    } catch (error) {
        console.error('Error blocking user:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to block user. Try using their phone number: .block 234XXXXXXXXX'
        }, { quoted: message });
    }
}

module.exports = blockCommand;
