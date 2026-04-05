/**
 * WALLYJAYTECH-MD - Block Command (LID Compatible)
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
            
            // Add country code if missing (assuming 234 as default)
            if (phoneNumber.length === 10) {
                phoneNumber = '234' + phoneNumber.substring(1);
            }
            
            if (phoneNumber.length >= 10) {
                targetNumber = phoneNumber;
                targetJid = phoneNumber + '@s.whatsapp.net';
            }
        }

        if (!targetJid) {
            return await sock.sendMessage(chatId, {
                text: '❌ Please specify a user to block.\n\nExamples:\n.block (in DM to block that user)\n.block @username (mention in group)\n.block 2348155763709 (phone number)\nReply to a message with .block'
            }, { quoted: message });
        }

        // Prevent blocking the bot itself
        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        if (targetJid === botJid) {
            return await sock.sendMessage(chatId, {
                text: '❌ You cannot block the bot itself!'
            }, { quoted: message });
        }

        console.log(`🔍 Attempting to block: ${targetJid}`);
        
        // METHOD 1: Try updateBlockStatus
        try {
            await sock.updateBlockStatus(targetJid, 'block');
            console.log(`✅ Blocked via updateBlockStatus: ${targetJid}`);
            
            await sock.sendMessage(chatId, {
                text: `✅ Successfully blocked user.\n🆔: ${targetJid}`
            }, { quoted: message });
            return;
        } catch (err1) {
            console.log(`⚠️ updateBlockStatus failed: ${err1.message}`);
            
            // METHOD 2: Try using query method for LIDs
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
                    text: `✅ Successfully blocked user.\n🆔: ${targetJid}`
                }, { quoted: message });
                return;
            } catch (err2) {
                console.log(`⚠️ Query method failed: ${err2.message}`);
                
                // METHOD 3: Try with phone number if available
                if (targetNumber) {
                    try {
                        await sock.updateBlockStatus(targetNumber + '@s.whatsapp.net', 'block');
                        console.log(`✅ Blocked via phone number: ${targetNumber}`);
                        
                        await sock.sendMessage(chatId, {
                            text: `✅ Successfully blocked user.\n📱: ${targetNumber}`
                        }, { quoted: message });
                        return;
                    } catch (err3) {
                        console.log(`⚠️ Phone number method failed: ${err3.message}`);
                    }
                }
                
                // METHOD 4: Try to resolve LID to phone number first
                try {
                    // Get contact info
                    const contact = await sock.getContact(targetJid);
                    if (contact && contact.phoneNumber) {
                        await sock.updateBlockStatus(contact.phoneNumber + '@s.whatsapp.net', 'block');
                        console.log(`✅ Blocked via resolved phone: ${contact.phoneNumber}`);
                        
                        await sock.sendMessage(chatId, {
                            text: `✅ Successfully blocked user.\n📱: ${contact.phoneNumber}`
                        }, { quoted: message });
                        return;
                    }
                } catch (err4) {
                    console.log(`⚠️ Contact resolution failed: ${err4.message}`);
                }
                
                throw new Error('All blocking methods failed');
            }
        }
        
    } catch (error) {
        console.error('Error blocking user:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to block user. Please try again.\n\nMake sure the user exists and you have the correct number.'
        }, { quoted: message });
    }
}

module.exports = blockCommand;
