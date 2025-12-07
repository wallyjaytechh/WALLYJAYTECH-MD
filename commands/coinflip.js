const fs = require('fs');
const path = require('path');

// File paths
const CHIPS_FILE = './data/chips.json';
const COINSTATS_FILE = './data/coinflip.json';

// Ensure data directory exists
if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data', { recursive: true });
}

// Load or initialize data
function loadData(file, defaultValue = {}) {
    try {
        if (fs.existsSync(file)) {
            return JSON.parse(fs.readFileSync(file, 'utf8'));
        }
    } catch (error) {
        console.error(`Error loading ${file}:`, error);
    }
    return defaultValue;
}

function saveData(file, data) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`Error saving ${file}:`, error);
    }
}

// Get user ID
function getUserId(message) {
    return message.key.participant || message.key.remoteJid;
}

// Get display name
async function getDisplayName(sock, userId, chatId) {
    try {
        if (userId.endsWith('@g.us')) {
            const metadata = await sock.groupMetadata(chatId);
            const participant = metadata.participants.find(p => p.id === userId);
            return participant?.notify || participant?.id.split('@')[0] || 'User';
        } else {
            const contact = await sock.getContact(userId);
            return contact?.notify || contact?.name || userId.split('@')[0];
        }
    } catch (error) {
        return userId.split('@')[0];
    }
}

// Coin flip logic
function flipCoin(bias = 0.5) {
    const result = Math.random() < bias ? 'heads' : 'tails';
    const emoji = result === 'heads' ? '🟡' : '⚫';
    return { result, emoji };
}

// Get user chips
function getUserChips(userId) {
    const chipsData = loadData(CHIPS_FILE, {});
    if (!chipsData[userId]) {
        chipsData[userId] = {
            chips: 1000, // Starting chips
            lastDaily: null,
            totalWon: 0,
            totalLost: 0
        };
        saveData(CHIPS_FILE, chipsData);
    }
    return chipsData[userId].chips;
}

// Update user chips
function updateUserChips(userId, amount, isWin = false) {
    const chipsData = loadData(CHIPS_FILE, {});
    if (!chipsData[userId]) {
        chipsData[userId] = {
            chips: 1000,
            lastDaily: null,
            totalWon: 0,
            totalLost: 0
        };
    }
    
    chipsData[userId].chips += amount;
    
    if (isWin && amount > 0) {
        chipsData[userId].totalWon += amount;
    } else if (amount < 0) {
        chipsData[userId].totalLost += Math.abs(amount);
    }
    
    // Ensure chips don't go negative
    if (chipsData[userId].chips < 0) chipsData[userId].chips = 0;
    
    saveData(CHIPS_FILE, chipsData);
    return chipsData[userId].chips;
}

// Update coin stats
function updateCoinStats(userId, choice, result, bet = 0, won = false) {
    const statsData = loadData(COINSTATS_FILE, {});
    
    if (!statsData[userId]) {
        statsData[userId] = {
            totalFlips: 0,
            heads: 0,
            tails: 0,
            withChoice: 0,
            wins: 0,
            losses: 0,
            wagered: 0,
            won: 0,
            currentStreak: 0,
            longestWinStreak: 0,
            lastFlip: new Date().toISOString(),
            achievements: []
        };
    }
    
    const userStats = statsData[userId];
    
    // Update basic stats
    userStats.totalFlips++;
    userStats.lastFlip = new Date().toISOString();
    
    if (result === 'heads') {
        userStats.heads++;
    } else {
        userStats.tails++;
    }
    
    // Update if user made a choice
    if (choice) {
        userStats.withChoice++;
        userStats.wagered += bet;
        
        if (won) {
            userStats.wins++;
            userStats.won += bet;
            userStats.currentStreak = Math.max(0, userStats.currentStreak) + 1;
            
            // Update longest win streak
            if (userStats.currentStreak > userStats.longestWinStreak) {
                userStats.longestWinStreak = userStats.currentStreak;
                
                // Achievement for 5+ streak
                if (userStats.currentStreak >= 5 && !userStats.achievements.includes('streak5')) {
                    userStats.achievements.push('streak5');
                }
            }
        } else {
            userStats.losses++;
            userStats.currentStreak = Math.min(0, userStats.currentStreak) - 1;
        }
        
        // Achievements
        if (userStats.totalFlips >= 10 && !userStats.achievements.includes('beginner')) {
            userStats.achievements.push('beginner');
        }
        if (userStats.wagered >= 1000 && !userStats.achievements.includes('gambler')) {
            userStats.achievements.push('gambler');
        }
        if (userStats.chips >= 5000 && !userStats.achievements.includes('rich')) {
            userStats.achievements.push('rich');
        }
    }
    
    saveData(COINSTATS_FILE, statsData);
    return userStats;
}

// Get user stats
function getUserStats(userId) {
    const statsData = loadData(COINSTATS_FILE, {});
    return statsData[userId] || null;
}

// Daily bonus
function claimDailyBonus(userId) {
    const chipsData = loadData(CHIPS_FILE, {});
    
    if (!chipsData[userId]) {
        chipsData[userId] = {
            chips: 1000,
            lastDaily: null,
            totalWon: 0,
            totalLost: 0
        };
    }
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    if (chipsData[userId].lastDaily === today) {
        return { success: false, message: 'You already claimed your daily bonus today!' };
    }
    
    chipsData[userId].chips += 100;
    chipsData[userId].lastDaily = today;
    
    saveData(CHIPS_FILE, chipsData);
    
    return { 
        success: true, 
        message: '🎁 Daily bonus claimed! +100 chips!',
        newBalance: chipsData[userId].chips 
    };
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Main coin flip command
async function coinflipCommand(sock, chatId, message, args) {
    try {
        const userId = getUserId(message);
        const userName = await getDisplayName(sock, userId, chatId);
        
        // Parse arguments
        let choice = null;
        let betAmount = 0;
        
        if (args.length > 0) {
            const firstArg = args[0].toLowerCase();
            
            // Check if first arg is heads/tails
            if (firstArg === 'heads' || firstArg === 'h' || firstArg === 'head') {
                choice = 'heads';
                args.shift();
            } else if (firstArg === 'tails' || firstArg === 't' || firstArg === 'tail') {
                choice = 'tails';
                args.shift();
            }
            
            // Check for bet amount
            if (args.length > 0) {
                const betArg = args[0];
                if (!isNaN(betArg) && parseInt(betArg) > 0) {
                    betAmount = parseInt(betArg);
                }
            }
        }
        
        // Validate bet
        const currentChips = getUserChips(userId);
        
        if (betAmount > 0) {
            if (betAmount > 500) {
                await sock.sendMessage(chatId, { 
                    text: '❌ Maximum bet is 500 chips!' 
                }, { quoted: message });
                return;
            }
            
            if (betAmount < 10) {
                await sock.sendMessage(chatId, { 
                    text: '❌ Minimum bet is 10 chips!' 
                }, { quoted: message });
                return;
            }
            
            if (betAmount > currentChips) {
                await sock.sendMessage(chatId, { 
                    text: `❌ You only have ${formatNumber(currentChips)} chips! Use .coindaily for free chips.` 
                }, { quoted: message });
                return;
            }
        }
        
        // Flip the coin
        const { result, emoji } = flipCoin();
        const resultEmoji = result === 'heads' ? '🟡' : '⚫';
        const choiceEmoji = choice === 'heads' ? '🟡' : (choice === 'tails' ? '⚫' : '');
        
        // Determine win/loss
        let won = false;
        let chipsChange = 0;
        let resultText = '';
        
        if (choice) {
            if (choice === result) {
                won = true;
                chipsChange = betAmount; // Win 1:1
                resultText = '🎉 *YOU WIN!*';
                
                // Streak bonus
                const userStats = getUserStats(userId);
                if (userStats && userStats.currentStreak >= 5) {
                    const bonus = Math.floor(betAmount * 0.1); // 10% bonus
                    chipsChange += bonus;
                    resultText += ` (+10% streak bonus!)`;
                }
            } else {
                won = false;
                chipsChange = -betAmount;
                resultText = '😔 *You lose!*';
            }
            
            // Update chips
            if (betAmount > 0) {
                const newBalance = updateUserChips(userId, chipsChange, won);
                
                // Update stats
                updateCoinStats(userId, choice, result, betAmount, won);
            }
        } else {
            // Just flip, no bet
            updateCoinStats(userId, null, result, 0, false);
        }
        
        // Build response message
        let response = `🪙 *COIN FLIP* 🪙\n\n`;
        
        if (choice) {
            response += `*Your Choice:* ${choice.toUpperCase()} ${choiceEmoji}\n`;
        }
        
        if (betAmount > 0) {
            response += `*Bet:* 💰 ${formatNumber(betAmount)} chips\n`;
        }
        
        response += `\n*Flipping...* 🌪️🌀✨\n\n`;
        response += `*Result:* ${result.toUpperCase()}! ${resultEmoji}\n\n`;
        
        if (choice) {
            response += `${resultText}\n`;
            
            if (betAmount > 0) {
                const changeSymbol = chipsChange > 0 ? '+' : '';
                response += `${changeSymbol}${formatNumber(chipsChange)} chips\n`;
                response += `*Balance:* 💰 ${formatNumber(getUserChips(userId))} chips\n`;
            }
        }
        
        // Add statistics
        const userStats = getUserStats(userId);
        if (userStats && userStats.totalFlips > 0) {
            response += `\n📊 *Your Statistics:*\n`;
            response += `Flips: ${formatNumber(userStats.totalFlips)}\n`;
            
            if (userStats.withChoice > 0) {
                const winRate = ((userStats.wins / userStats.withChoice) * 100).toFixed(1);
                response += `Win Rate: ${winRate}% (${userStats.wins}/${userStats.withChoice})\n`;
            }
            
            if (userStats.currentStreak > 0) {
                response += `Streak: 🔥 ${userStats.currentStreak} wins\n`;
            } else if (userStats.currentStreak < 0) {
                response += `Streak: 💀 ${Math.abs(userStats.currentStreak)} losses\n`;
            }
        }
        
        // Add global stats (optional)
        const allStats = loadData(COINSTATS_FILE, {});
        let totalHeads = 0;
        let totalTails = 0;
        let totalFlips = 0;
        
        Object.values(allStats).forEach(stats => {
            totalHeads += stats.heads;
            totalTails += stats.tails;
            totalFlips += stats.totalFlips;
        });
        
        if (totalFlips > 0) {
            const headsPercent = ((totalHeads / totalFlips) * 100).toFixed(1);
            response += `\n🌎 *Global Stats:*\n`;
            response += `Heads: ${headsPercent}% | Tails: ${(100 - headsPercent).toFixed(1)}%\n`;
            response += `Total Flips: ${formatNumber(totalFlips)}`;
        }
        
        // Send response
        await sock.sendMessage(chatId, { 
            text: response
        }, { quoted: message });
        
    } catch (error) {
        console.error('Error in coinflip command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error processing coin flip. Please try again.' 
        }, { quoted: message });
    }
}

// Statistics command
async function coinstatsCommand(sock, chatId, message, args) {
    try {
        const userId = getUserId(message);
        const userName = await getDisplayName(sock, userId, chatId);
        const userStats = getUserStats(userId);
        const chips = getUserChips(userId);
        
        if (!userStats || userStats.totalFlips === 0) {
            await sock.sendMessage(chatId, { 
                text: `📊 *COIN FLIP STATISTICS*\n\nYou haven't flipped any coins yet!\nUse \`.coinflip\` to start playing!` 
            }, { quoted: message });
            return;
        }
        
        let response = `📊 *COIN FLIP STATISTICS*\n`;
        response += `Player: ${userName}\n\n`;
        
        // Basic stats
        response += `🎯 *Basic Stats:*\n`;
        response += `Total Flips: ${formatNumber(userStats.totalFlips)}\n`;
        response += `Heads: ${formatNumber(userStats.heads)} (${((userStats.heads / userStats.totalFlips) * 100).toFixed(1)}%)\n`;
        response += `Tails: ${formatNumber(userStats.tails)} (${((userStats.tails / userStats.totalFlips) * 100).toFixed(1)}%)\n\n`;
        
        // Choice stats
        if (userStats.withChoice > 0) {
            response += `🎲 *With Choice:*\n`;
            response += `Choices Made: ${formatNumber(userStats.withChoice)}\n`;
            response += `Wins: ${formatNumber(userStats.wins)} (${((userStats.wins / userStats.withChoice) * 100).toFixed(1)}%)\n`;
            response += `Losses: ${formatNumber(userStats.losses)}\n\n`;
        }
        
        // Betting stats
        response += `💰 *Betting Stats:*\n`;
        response += `Current Chips: 💰 ${formatNumber(chips)}\n`;
        
        if (userStats.wagered > 0) {
            response += `Total Wagered: 💰 ${formatNumber(userStats.wagered)}\n`;
            response += `Total Won: 💰 +${formatNumber(userStats.won)}\n`;
            response += `Net Profit: 💰 ${userStats.won - (userStats.wagered - userStats.won) >= 0 ? '+' : ''}${formatNumber(userStats.won - (userStats.wagered - userStats.won))}\n\n`;
        }
        
        // Streak stats
        response += `🔥 *Streaks:*\n`;
        response += `Current Streak: `;
        if (userStats.currentStreak > 0) {
            response += `🔥 ${userStats.currentStreak} wins`;
        } else if (userStats.currentStreak < 0) {
            response += `💀 ${Math.abs(userStats.currentStreak)} losses`;
        } else {
            response += `⚪ None`;
        }
        response += `\nLongest Win Streak: 🔥 ${formatNumber(userStats.longestWinStreak)}\n\n`;
        
        // Achievements
        if (userStats.achievements && userStats.achievements.length > 0) {
            response += `🏅 *Achievements Unlocked:*\n`;
            const achievementNames = {
                'beginner': '🎯 Beginner (10 flips)',
                'gambler': '🎰 Gambler (1,000 chips wagered)',
                'streak5': '🔥 Hot Streak (5 wins in a row)',
                'rich': '💰 Rich (5,000+ chips)'
            };
            
            userStats.achievements.forEach(achievement => {
                if (achievementNames[achievement]) {
                    response += `✅ ${achievementNames[achievement]}\n`;
                }
            });
        }
        
        // Last flip
        if (userStats.lastFlip) {
            const lastFlipDate = new Date(userStats.lastFlip);
            const now = new Date();
            const diffHours = Math.floor((now - lastFlipDate) / (1000 * 60 * 60));
            
            response += `\n⏰ *Last Flip:* `;
            if (diffHours < 1) {
                response += `Just now`;
            } else if (diffHours < 24) {
                response += `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            } else {
                response += `${Math.floor(diffHours / 24)} day${Math.floor(diffHours / 24) > 1 ? 's' : ''} ago`;
            }
        }
        
        await sock.sendMessage(chatId, { 
            text: response 
        }, { quoted: message });
        
    } catch (error) {
        console.error('Error in coinstats command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error fetching statistics.' 
        }, { quoted: message });
    }
}

// Daily bonus command
async function coindailyCommand(sock, chatId, message) {
    try {
        const userId = getUserId(message);
        const userName = await getDisplayName(sock, userId, chatId);
        
        const result = claimDailyBonus(userId);
        
        if (result.success) {
            const response = `🎁 *DAILY BONUS*\n\n${result.message}\n\nNew Balance: 💰 ${formatNumber(result.newBalance)} chips\n\nCome back tomorrow for more!`;
            await sock.sendMessage(chatId, { 
                text: response 
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { 
                text: `🎁 *DAILY BONUS*\n\n${result.message}\n\nCome back tomorrow!` 
            }, { quoted: message });
        }
        
    } catch (error) {
        console.error('Error in coindaily command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error claiming daily bonus.' 
        }, { quoted: message });
    }
}

// Leaderboard command
async function coinleaderboardCommand(sock, chatId, message) {
    try {
        const chipsData = loadData(CHIPS_FILE, {});
        const statsData = loadData(COINSTATS_FILE, {});
        
        // Get top 10 by chips
        const topPlayers = Object.entries(chipsData)
            .filter(([userId, data]) => data.chips > 0)
            .sort((a, b) => b[1].chips - a[1].chips)
            .slice(0, 10);
        
        if (topPlayers.length === 0) {
            await sock.sendMessage(chatId, { 
                text: `🏆 *COIN FLIP LEADERBOARD*\n\nNo players yet! Be the first to use \`.coinflip\`!` 
            }, { quoted: message });
            return;
        }
        
        let response = `🏆 *COIN FLIP LEADERBOARD* 🏆\n\n`;
        
        // Top players by chips
        response += `💰 *Top by Chips:*\n`;
        for (let i = 0; i < topPlayers.length; i++) {
            const [userId, data] = topPlayers[i];
            const userStats = statsData[userId];
            const profit = data.chips - 1000; // Starting chips were 1000
            
            response += `${i + 1}. `;
            if (i === 0) response += `👑 `;
            else if (i === 1) response += `🥈 `;
            else if (i === 2) response += `🥉 `;
            
            response += `💰 ${formatNumber(data.chips)} `;
            response += `(${profit >= 0 ? '+' : ''}${formatNumber(profit)})\n`;
        }
        
        // Additional stats
        const allStats = Object.values(statsData);
        if (allStats.length > 0) {
            // Highest win rate (min 10 choices)
            const qualified = allStats.filter(s => s.withChoice >= 10);
            if (qualified.length > 0) {
                const bestAccuracy = qualified.sort((a, b) => (b.wins / b.withChoice) - (a.wins / a.withChoice))[0];
                const winRate = ((bestAccuracy.wins / bestAccuracy.withChoice) * 100).toFixed(1);
                response += `\n🎯 *Best Accuracy:* ${winRate}% (${bestAccuracy.wins}/${bestAccuracy.withChoice})`;
            }
            
            // Longest streak
            const bestStreak = allStats.sort((a, b) => b.longestWinStreak - a.longestWinStreak)[0];
            if (bestStreak.longestWinStreak > 0) {
                response += `\n🔥 *Longest Streak:* ${bestStreak.longestWinStreak} wins`;
            }
            
            // Most flips
            const mostFlips = allStats.sort((a, b) => b.totalFlips - a.totalFlips)[0];
            response += `\n🎰 *Most Active:* ${formatNumber(mostFlips.totalFlips)} flips`;
        }
        
        // Global totals
        let totalChips = 0;
        let totalFlips = 0;
        let totalHeads = 0;
        
        Object.values(chipsData).forEach(data => totalChips += data.chips);
        Object.values(statsData).forEach(data => {
            totalFlips += data.totalFlips;
            totalHeads += data.heads;
        });
        
        const headsPercent = totalFlips > 0 ? ((totalHeads / totalFlips) * 100).toFixed(1) : '0.0';
        
        response += `\n\n🌎 *Global Statistics:*`;
        response += `\nTotal Players: ${Object.keys(chipsData).length}`;
        response += `\nTotal Chips in Play: 💰 ${formatNumber(totalChips)}`;
        response += `\nTotal Flips: ${formatNumber(totalFlips)}`;
        response += `\nHeads/Tails Ratio: ${headsPercent}% / ${(100 - headsPercent).toFixed(1)}%`;
        
        response += `\n\nUse \`.coinstats\` for your personal statistics!`;
        
        await sock.sendMessage(chatId, { 
            text: response 
        }, { quoted: message });
        
    } catch (error) {
        console.error('Error in coinleaderboard command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error fetching leaderboard.' 
        }, { quoted: message });
    }
}

// Help command
async function coinhelpCommand(sock, chatId, message) {
    const response = `🪙 *COIN FLIP HELP* 🪙\n\n` +
        `*Basic Commands:*\n` +
        `• \`.coinflip\` - Flip a coin (no bet)\n` +
        `• \`.coinflip heads\` - Choose heads\n` +
        `• \`.coinflip tails\` - Choose tails\n` +
        `• \`.coinflip heads 100\` - Bet 100 chips on heads\n\n` +
        
        `*Statistics & Info:*\n` +
        `• \`.coinstats\` - Your statistics\n` +
        `• \`.coinleaderboard\` - Top players\n` +
        `• \`.coindaily\` - Claim 100 free chips daily\n` +
        `• \`.coinhelp\` - This help menu\n\n` +
        
        `*Game Rules:*\n` +
        `• Start with 1,000 chips\n` +
        `• Min bet: 10 chips\n` +
        `• Max bet: 500 chips\n` +
        `• Payout: 1:1 (win what you bet)\n` +
        `• Streak bonus: 10% extra for 5+ wins\n\n` +
        
        `*Achievements:*\n` +
        `🏅 Unlock achievements by playing!\n\n` +
        
        `*Example:*\n` +
        `\`.coinflip tails 50\` - Bet 50 chips on tails`;
    
    await sock.sendMessage(chatId, { 
        text: response 
    }, { quoted: message });
}

// Export all commands
module.exports = {
    coinflipCommand,
    coinstatsCommand,
    coindailyCommand,
    coinleaderboardCommand,
    coinhelpCommand
};
