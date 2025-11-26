 const fs = require('fs');
const path = require('path');

async function tempfileCommand(sock, chatId, message) {
    try {
        const tmpDir = './tmp';
        
        if (!fs.existsSync(tmpDir)) {
            await sock.sendMessage(chatId, { 
                text: '✅ *Tmp folder is empty!*' 
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
                text: '✅ *Tmp folder is empty!*' 
            }, { quoted: message });
            return;
        }

        // Sort by modification date (newest first)
        fileList.sort((a, b) => b.modified - a.modified);

        const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
        
        // Create file list message
        let fileListText = `📁 *TEMP FOLDER CONTENTS* 📁\n\n`;
        fileListText += `📊 *Total Files:* ${fileList.length}\n`;
        fileListText += `📦 *Total Size:* ${sizeMB} MB\n\n`;
        fileListText += `📋 *Files in temp folder:*\n`;

        // Show first 20 files
        const filesToShow = fileList.slice(0, 20);
        
        filesToShow.forEach((file, index) => {
            const timeAgo = getTimeAgo(file.modified);
            fileListText += `\n${index + 1}. 📄 ${file.name}\n   📏 ${file.size} KB | ⏰ ${timeAgo}`;
        });

        // If there are more files, show count
        if (fileList.length > 20) {
            fileListText += `\n\n... and ${fileList.length - 20} more files`;
        }

        fileListText += `\n\n🔧 *Use:* .cleartmp *to delete all temp files*`;

        await sock.sendMessage(chatId, { 
            text: fileListText 
        }, { quoted: message });

    } catch (error) {
        console.error('Error reading tmp folder:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ *Error reading temp folder!*' 
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

module.exports = tempfileCommand;
