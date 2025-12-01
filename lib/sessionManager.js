const fs = require('fs');
const path = require('path');
const { useMultiFileAuthState } = require("@whiskeysockets/baileys");

class SessionManager {
    constructor() {
        this.sessionsFile = './data/activeSessions.json';
        this.maxSessions = 3; // You + 2 others
        this.init();
    }

    init() {
        const dir = path.dirname(this.sessionsFile);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        if (!fs.existsSync(this.sessionsFile)) {
            this.saveSessions({ 
                owner: null, 
                users: [],
                pairCodes: {} 
            });
        }
    }

    getSessions() {
        try {
            return JSON.parse(fs.readFileSync(this.sessionsFile, 'utf8'));
        } catch {
            return { owner: null, users: [], pairCodes: {} };
        }
    }

    saveSessions(data) {
        fs.writeFileSync(this.sessionsFile, JSON.stringify(data, null, 2));
        return true;
    }

    // Check if user has active session
    hasSession(userJid) {
        const sessions = this.getSessions();
        return sessions.owner === userJid || sessions.users.includes(userJid);
    }

    // Set owner session (you)
    setOwner(userJid) {
        const sessions = this.getSessions();
        sessions.owner = userJid;
        return this.saveSessions(sessions);
    }

    // Add user session
    addUserSession(userJid) {
        const sessions = this.getSessions();
        if (sessions.users.length >= this.maxSessions - 1) { // -1 for owner
            return { success: false, message: '❌ No available slots! Maximum 2 users reached.' };
        }
        if (sessions.users.includes(userJid)) {
            return { success: false, message: '❌ User already has an active session!' };
        }
        
        sessions.users.push(userJid);
        this.saveSessions(sessions);
        return { 
            success: true, 
            message: `✅ Session added! User can now link their WhatsApp.`,
            slotsRemaining: (this.maxSessions - 1) - sessions.users.length
        };
    }

    // Remove user session
    removeUserSession(userJid) {
        const sessions = this.getSessions();
        const index = sessions.users.indexOf(userJid);
        if (index > -1) {
            sessions.users.splice(index, 1);
            
            // Also delete their session folder
            const userSessionPath = `./sessions/user_${userJid.split('@')[0]}`;
            if (fs.existsSync(userSessionPath)) {
                fs.rmSync(userSessionPath, { recursive: true, force: true });
            }
            
            this.saveSessions(sessions);
            return { success: true, message: '✅ User session removed completely.' };
        }
        return { success: false, message: '❌ User session not found.' };
    }

    // Generate pairing code for new users
    generatePairCode(userJid) {
        const sessions = this.getSessions();
        const pairCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        sessions.pairCodes[pairCode] = {
            forUser: userJid,
            generatedBy: sessions.owner,
            createdAt: Date.now(),
            expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes
        };
        
        this.saveSessions(sessions);
        return pairCode;
    }

    // Validate pairing code
    validatePairCode(code, userJid) {
        const sessions = this.getSessions();
        const pairData = sessions.pairCodes[code];
        
        if (!pairData) return { valid: false, message: '❌ Invalid pairing code!' };
        if (Date.now() > pairData.expiresAt) {
            delete sessions.pairCodes[code];
            this.saveSessions(sessions);
            return { valid: false, message: '❌ Pairing code expired!' };
        }
        if (pairData.forUser !== userJid) {
            return { valid: false, message: '❌ This code is not for you!' };
        }

        // Code is valid - add user session
        delete sessions.pairCodes[code];
        this.saveSessions(sessions);
        return this.addUserSession(userJid);
    }

    // Get all active sessions info
    getSessionInfo() {
        const sessions = this.getSessions();
        return {
            owner: sessions.owner,
            users: sessions.users,
            totalSlots: this.maxSessions,
            usedSlots: 1 + sessions.users.length, // owner + users
            availableSlots: this.maxSessions - (1 + sessions.users.length),
            activePairCodes: Object.keys(sessions.pairCodes).length
        };
    }

    // Clean expired pair codes
    cleanExpired() {
        const sessions = this.getSessions();
        const now = Date.now();
        let cleaned = 0;

        for (const [code, data] of Object.entries(sessions.pairCodes)) {
            if (now > data.expiresAt) {
                delete sessions.pairCodes[code];
                cleaned++;
            }
        }

        if (cleaned > 0) this.saveSessions(sessions);
        return cleaned;
    }
}

// Auto-clean every 5 minutes
const sessionManager = new SessionManager();
setInterval(() => {
    const cleaned = sessionManager.cleanExpired();
    if (cleaned > 0) {
        console.log(`🧹 Cleaned ${cleaned} expired pair codes`);
    }
}, 5 * 60 * 1000);

module.exports = sessionManager;
