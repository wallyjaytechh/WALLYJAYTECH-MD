const fs = require('fs');
const path = require('path');

async function clearTmpCommand(sock, chatId, message) {
    try {
        const tmpDir = './tmp';
        
        if (!fs.existsSync(tmpDir)) {
            await sock.sendMessage(chatId, { 
                text: '✅ *Tmp folder is already clean!*' 
            }, { quoted: message });
            return;
        }

        const files = fs.readdirSync(tmpDir);
        let totalSize = 0;
        let deletedCount = 0;
        
        // Get total size first
        for (const file of files) {
            const filePath = path.join(tmpDir, file);
            if (fs.statSync(filePath).isFile()) {
                totalSize += fs.statSync(filePath).size;
            }
        }

        // Delete all files
        for (const file of files) {
            const filePath = path.join(tmpDir, file);
            if (fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
                deletedCount++;
            }
        }

        const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
        
        await sock.sendMessage(chatId, { 
            text: `🧹 *Tmp Cleanup Complete!*\n\n🗑️ *Deleted:* ${deletedCount} files\n📦 *Freed:* ${sizeMB} MB\n\n✅ All temporary files have been removed.` 
        }, { quoted: message });

        console.log(`✅ Cleared tmp folder: ${deletedCount} files, ${sizeMB} MB`);

    } catch (error) {
        console.error('Error clearing tmp:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ *Error clearing tmp folder!*' 
        }, { quoted: message });
    }
}

module.exports = clearTmpCommand;
