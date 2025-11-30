const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning up temporary files...');

// Clean temp files
const tempDir = './temp';
if (fs.existsSync(tempDir)) {
    const files = fs.readdirSync(tempDir);
    files.forEach(file => {
        const filePath = path.join(tempDir, file);
        try {
            fs.unlinkSync(filePath);
            console.log(`✅ Deleted: ${file}`);
        } catch (err) {
            console.log(`❌ Failed to delete: ${file}`);
        }
    });
}

// Clean session files (optional - be careful)
const sessionDir = './session';
if (fs.existsSync(sessionDir)) {
    console.log('📁 Session folder preserved');
}

console.log('✅ Cleanup completed!');
