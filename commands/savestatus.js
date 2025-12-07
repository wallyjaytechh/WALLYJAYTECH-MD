const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// File to store saved statuses
const SAVED_STATUS_FILE = './data/saved_statuses.json';

// Ensure data directory exists
if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data', { recursive: true });
}

// Load saved statuses
function loadSavedStatuses() {
    try {
        if (fs.existsSync(SAVED_STATUS_FILE)) {
            return JSON.parse(fs.readFileSync(SAVED_STATUS_FILE, 'utf8'));
        }
    } catch (error) {
        console.error('Error loading saved statuses:', error);
    }
    return {};
}

// Save statuses to file
function saveStatuses(data) {
    try {
        fs.writeFileSync(SAVED_STATUS_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving statuses:', error);
    }
}

// Get user ID
function getUserId(message) {
    return message.key.participant || message.key.remoteJid;
}

// Get display name
async function getDisplayName(sock, userId) {
    try {
        const contact = await sock.getContact(userId).catch(() => null);
        return contact?.notify || contact?.name || userId.split('@')[0];
    } catch (error) {
        return userId.split('@')[0];
    }
}

// Download media from message
async function downloadMedia(sock, message, type) {
    try {
        const mediaType = type === 'image' ? 'imageMessage' : 
                         type === 'video' ? 'videoMessage' : 
                         type === 'audio' ? 'audioMessage' : null;
        
        if (!mediaType || !message.message?.[mediaType]) {
            return null;
        }

        const stream = await downloadContentFromMessage(message.message[mediaType], type);
        let buffer = Buffer.from([]);
        
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        
        return buffer;
    } catch (error) {
        console.error('Error downloading media:', error);
        return null;
    }
}

// Save status to storage
async function saveStatusToStorage(sock, message, saveTo, saverId, statusType) {
    const statusId = `status_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    const statuses = loadSavedStatuses();
    
    if (!statuses[saverId]) {
        statuses[saverId] = [];
    }
    
    const statusData = {
        id: statusId,
        timestamp: timestamp,
        type: statusType,
        saveTo: saveTo,
        originalSender: message.key?.remoteJid || 'unknown'
    };
    
    // Save text if available
    if (message.message?.conversation) {
        statusData.text = message.message.conversation;
    } else if (message.message?.extendedTextMessage?.text) {
        statusData.text = message.message.extendedTextMessage.text;
    } else if (message.message?.imageMessage?.caption) {
        statusData.text = message.message.imageMessage.caption;
    } else if (message.message?.videoMessage?.caption) {
        statusData.text = message.message.videoMessage.caption;
    }
    
    // Handle media
    if (statusType === 'image') {
        const imageBuffer = await downloadMedia(sock, message, 'image');
        if (imageBuffer) {
            const fileName = `./temp/status_${statusId}.jpg`;
            fs.writeFileSync(fileName, imageBuffer);
            statusData.mediaPath = fileName;
            statusData.hasMedia = true;
        }
    } else if (statusType === 'video') {
        const videoBuffer = await downloadMedia(sock, message, 'video');
        if (videoBuffer) {
            const fileName = `./temp/status_${statusId}.mp4`;
            fs.writeFileSync(fileName, videoBuffer);
            statusData.mediaPath = fileName;
            statusData.hasMedia = true;
        }
    } else if (statusType === 'audio') {
        const audioBuffer = await downloadMedia(sock, message, 'audio');
        if (audioBuffer) {
            const fileName = `./temp/status_${statusId}.opus`;
            fs.writeFileSync(fileName, audioBuffer);
            statusData.mediaPath = fileName;
            statusData.hasMedia = true;
        }
    }
    
    statuses[saverId].push(statusData);
    
    // Keep only last 50 statuses per user
    if (statuses[saverId].length > 50) {
        statuses[saverId] = statuses[saverId].slice(-50);
    }
    
    saveStatuses(statuses);
    return { success: true, statusId, statusData };
}

// Main save command
async function saveStatusCommand(sock, chatId, message, args) {
    try {
        const userId = getUserId(message);
        const userName = await getDisplayName(sock, userId);
        
        // Check if replying to a status
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const isStatusReply = message.key?.remoteJid === 'status@broadcast';
        
        if (!isStatusReply && !quotedMessage) {
            const helpText = `💊 *STATUS SAVER*\n\n` +
                `*Usage:*\n` +
                `1. *Reply to any status* with:\n` +
                `   💊 (just the pill emoji) - Save discreetly\n` +
                `   .save - Save with options\n\n` +
                `2. *In chat:*\n` +
                `.save [option]\n\n` +
                `*Options:*\n` +
                `• bot - Save to bot's DM\n` +
                `• me - Send to your DM\n` +
                `• quiet - Save without notification\n\n` +
                `*Example:*\n` +
                `.save me - Save status to your DM\n` +
                `.save bot - Save to bot storage\n` +
                `.save quiet - Save silently`;
            
            await sock.sendMessage(chatId, { text: helpText }, { quoted: message });
            return;
        }
        
        // Determine save option
        const option = args[0]?.toLowerCase() || 'quiet';
        const validOptions = ['bot', 'me', 'quiet', 'silent'];
        const saveOption = validOptions.includes(option) ? option : 'quiet';
        
        // Determine status type
        let statusType = 'text';
        let targetMessage = message;
        
        if (isStatusReply) {
            targetMessage = message;
        } else if (quotedMessage) {
            // Create a mock message object from quoted message
            targetMessage = {
                key: { remoteJid: chatId },
                message: quotedMessage
            };
        }
        
        // Check message type
        if (targetMessage.message?.imageMessage) {
            statusType = 'image';
        } else if (targetMessage.message?.videoMessage) {
            statusType = 'video';
        } else if (targetMessage.message?.audioMessage) {
            statusType = 'audio';
        } else if (targetMessage.message?.conversation || targetMessage.message?.extendedTextMessage) {
            statusType = 'text';
        }
        
        // Save the status
        const result = await saveStatusToStorage(sock, targetMessage, saveOption, userId, statusType);
        
        if (!result.success) {
            await sock.sendMessage(chatId, { text: '❌ Failed to save status.' }, { quoted: message });
            return;
        }
        
        // Handle based on save option
        if (saveOption === 'me') {
            // Send saved status to user's DM
            const userJid = userId.endsWith('@s.whatsapp.net') ? userId : `${userId.split('@')[0]}@s.whatsapp.net`;
            
            const saveMessage = `✅ *Status Saved!*\n\n` +
                `📁 Saved to your collection\n` +
                `🆔 ID: ${result.statusId}\n` +
                `📅 ${new Date(result.statusData.timestamp).toLocaleString()}\n\n` +
                `Use \`.mysaves\` to view your saved statuses`;
            
            await sock.sendMessage(userJid, { text: saveMessage });
            
            if (isStatusReply) {
                await sock.sendMessage(chatId, { text: '✅ Status saved to your DM!' });
            } else {
                await sock.sendMessage(chatId, { text: '✅ Status saved to your DM!' }, { quoted: message });
            }
            
        } else if (saveOption === 'bot') {
            // Save to bot's storage only
            if (isStatusReply) {
                await sock.sendMessage(chatId, { text: '💊 Status saved to bot storage.' });
            } else {
                await sock.sendMessage(chatId, { text: '💊 Status saved to bot storage.' }, { quoted: message });
            }
            
        } else { // quiet/silent
            // No response at all for discreet saving
            if (!isStatusReply) {
                await sock.sendMessage(chatId, { text: '💊' }, { quoted: message });
            }
            // For status replies, don't send anything (discreet)
        }
        
    } catch (error) {
        console.error('Error in save command:', error);
        try {
            await sock.sendMessage(chatId, { text: '❌ Error saving status.' }, { quoted: message });
        } catch (e) {}
    }
}

// Handle pill emoji reaction (discreet save)
async function handlePillEmoji(sock, messageUpdate) {
    try {
        const message = messageUpdate.messages[0];
        
        // Check if it's a status broadcast
        if (message.key?.remoteJid !== 'status@broadcast') {
            return;
        }
        
        // Check for pill emoji reaction
        if (message.message?.reactionMessage?.text === '💊') {
            const userId = message.key.participant || message.key.remoteJid;
            
            // Save discreetly (quiet mode)
            const result = await saveStatusToStorage(sock, message, 'quiet', userId, 'status');
            
            if (result.success) {
                // Optional: Send discreet confirmation to user's DM
                const userJid = userId.endsWith('@s.whatsapp.net') ? userId : `${userId.split('@')[0]}@s.whatsapp.net`;
                const discreetMsg = `💊 Status saved discreetly.\nID: ${result.statusId}`;
                
                await sock.sendMessage(userJid, { text: discreetMsg });
            }
        }
    } catch (error) {
        console.error('Error handling pill emoji:', error);
    }
}

// View saved statuses
async function mySavesCommand(sock, chatId, message) {
    try {
        const userId = getUserId(message);
        const statuses = loadSavedStatuses();
        const userStatuses = statuses[userId] || [];
        
        if (userStatuses.length === 0) {
            await sock.sendMessage(chatId, { 
                text: '📭 You have no saved statuses.\n\nReply to any status with 💊 or .save to save one!' 
            }, { quoted: message });
            return;
        }
        
        // Show last 10 saved statuses
        const recentStatuses = userStatuses.slice(-10).reverse();
        
        let response = `📚 *YOUR SAVED STATUSES*\n\n`;
        response += `Total Saved: ${userStatuses.length}\n\n`;
        
        recentStatuses.forEach((status, index) => {
            const date = new Date(status.timestamp).toLocaleDateString();
            const typeEmoji = status.type === 'image' ? '🖼️' : 
                            status.type === 'video' ? '🎥' : 
                            status.type === 'audio' ? '🎵' : '📝';
            
            response += `${index + 1}. ${typeEmoji} ${date}\n`;
            if (status.text && status.text.length > 0) {
                const preview = status.text.length > 50 ? status.text.substring(0, 50) + '...' : status.text;
                response += `   "${preview}"\n`;
            }
            response += `   🆔 ${status.id}\n`;
            response += `   ──────────────\n`;
        });
        
        response += `\n*Commands:*\n`;
        response += `• .viewsave [id] - View a saved status\n`;
        response += `• .deletesave [id] - Delete a saved status\n`;
        response += `• .clearsaves - Clear all saved statuses`;
        
        await sock.sendMessage(chatId, { text: response }, { quoted: message });
        
    } catch (error) {
        console.error('Error in mysaves command:', error);
        await sock.sendMessage(chatId, { text: '❌ Error loading saved statuses.' }, { quoted: message });
    }
}

// View specific saved status
async function viewSaveCommand(sock, chatId, message, args) {
    try {
        const userId = getUserId(message);
        const statusId = args[0];
        
        if (!statusId) {
            await sock.sendMessage(chatId, { 
                text: 'Usage: .viewsave [status-id]\n\nUse .mysaves to get your status IDs.' 
            }, { quoted: message });
            return;
        }
        
        const statuses = loadSavedStatuses();
        const userStatuses = statuses[userId] || [];
        const status = userStatuses.find(s => s.id === statusId);
        
        if (!status) {
            await sock.sendMessage(chatId, { 
                text: '❌ Status not found. Check the ID and try again.' 
            }, { quoted: message });
            return;
        }
        
        // Send the saved status
        const caption = `📁 *Saved Status*\n\n` +
                       `🆔 ${status.id}\n` +
                       `📅 ${new Date(status.timestamp).toLocaleString()}\n` +
                       `📦 Saved to: ${status.saveTo}\n\n` +
                       (status.text || 'No text content');
        
        if (status.hasMedia && fs.existsSync(status.mediaPath)) {
            const mediaType = status.type === 'image' ? 'image' : 
                            status.type === 'video' ? 'video' : 'audio';
            
            const mediaBuffer = fs.readFileSync(status.mediaPath);
            
            await sock.sendMessage(chatId, {
                [mediaType]: mediaBuffer,
                caption: caption,
                mimetype: mediaType === 'image' ? 'image/jpeg' : 
                         mediaType === 'video' ? 'video/mp4' : 'audio/ogg'
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { text: caption }, { quoted: message });
        }
        
    } catch (error) {
        console.error('Error in viewsave command:', error);
        await sock.sendMessage(chatId, { text: '❌ Error viewing status.' }, { quoted: message });
    }
}

// Export all functions
module.exports = {
    saveStatusCommand,
    handlePillEmoji,
    mySavesCommand,
    viewSaveCommand
};
