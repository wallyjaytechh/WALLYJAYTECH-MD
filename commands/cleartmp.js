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

        // Get all files with details
        const files = fs.readdirSync(tmpDir);
        let totalSize = 0;
        let fileList = [];
        
        for (const file of files) {
            const filePath = path.join(tmpDir, file);
            if (fs.statSync(filePath).isFile()) {
                const stats = fs.statSync(filePath);
                const sizeKB = (stats.size / 1024).toFixed(2);
                totalSize += stats.size;
                
                fileList.push({
                    name: file,
                    size: sizeKB,
                    modified: stats.mtime
                });
            }
        }

        if (fileList.length === 0) {
            await sock.sendMessage(chatId, { 
                text: '✅ *Tmp folder is already empty!*' 
            }, { quoted: message });
            return;
        }

        // Sort by modification date (newest first)
        fileList.sort((a, b) => b.modified - a.modified);

        const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
        
        // Create file list message
        let fileListText = `📁 *TMP FOLDER CONTENTS* 📁\n\n`;
        fileListText += `📊 *Total Files:* ${fileList.length}\n`;
        fileListText += `📦 *Total Size:* ${sizeMB} MB\n\n`;
        fileListText += `📋 *Files to be deleted:*\n`;

        // Show first 15 files (to avoid message being too long)
        const filesToShow = fileList.slice(0, 15);
        
        filesToShow.forEach((file, index) => {
            const timeAgo = getTimeAgo(file.modified);
            fileListText += `\n${index + 1}. 📄 ${file.name}\n   📏 ${file.size} KB | ⏰ ${timeAgo}`;
        });

        // If there are more files, show count
        if (fileList.length > 15) {
            fileListText += `\n\n... and ${fileList.length - 15} more files`;
        }

        fileListText += `\n\n⚠️ *This will delete ALL files shown above.*\n`;
        fileListText += `🔧 *Use:* .cleartmp confirm *to proceed*`;

        await sock.sendMessage(chatId, { 
            text: fileListText 
        }, { quoted: message });

    } catch (error) {
        console.error('Error reading tmp folder:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ *Error reading tmp folder!*' 
        }, { quoted: message });
    }
}

// Helper function to get time ago
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}

// Function to actually delete files (called with .cleartmp confirm)
async function confirmClearTmp(sock, chatId, message) {
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

// Main handler function
async function handleClearTmpCommand(sock, chatId, message, args) {
    const action = args?.toLowerCase();
    
    if (action === 'confirm') {
        await confirmClearTmp(sock, chatId, message);
    } else {
        await clearTmpCommand(sock, chatId, message);
    }
}

module.exports = handleClearTmpCommand;
