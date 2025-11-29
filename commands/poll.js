/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Poll Command - Create polls in WhatsApp groups
 */

const fs = require('fs');
const path = require('path');

// Store active polls
const POLLS_FILE = path.join(__dirname, '../data/polls.json');

// Initialize polls file
function initPolls() {
    if (!fs.existsSync(POLLS_FILE)) {
        fs.writeFileSync(POLLS_FILE, JSON.stringify({ polls: {} }, null, 2));
    }
    return JSON.parse(fs.readFileSync(POLLS_FILE, 'utf8'));
}

// Save polls data
function savePolls(data) {
    fs.writeFileSync(POLLS_FILE, JSON.stringify(data, null, 2));
}

// Create poll
async function createPoll(sock, chatId, question, options, message) {
    try {
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, {
                text: '❌ Polls can only be created in groups!',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }

        // Validate options
        if (options.length < 2) {
            await sock.sendMessage(chatId, {
                text: '❌ Poll must have at least 2 options!',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }

        if (options.length > 10) {
            await sock.sendMessage(chatId, {
                text: '❌ Poll can have maximum 10 options!',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }

        // Create poll message
        let pollMessage = `📊 *POLL CREATED* 📊\n\n`;
        pollMessage += `*Question:* ${question}\n\n`;
        pollMessage += `*Options:*\n`;
        
        options.forEach((option, index) => {
            pollMessage += `${index + 1}️⃣ ${option}\n`;
        });

        pollMessage += `\n*How to vote:*\n`;
        pollMessage += `• Reply with .vote <number>\n`;
        pollMessage += `• Example: .vote 1\n\n`;
        pollMessage += `• Use .poll results to see current results\n`;
        pollMessage += `• Use .poll end to close this poll`;

        // Create poll data
        const pollId = Date.now().toString();
        const pollsData = initPolls();
        
        pollsData.polls[pollId] = {
            question,
            options: options.map((opt, index) => ({
                text: opt,
                number: index + 1,
                votes: 0,
                voters: []
            })),
            createdBy: message.key.participant || message.key.remoteJid,
            chatId,
            createdAt: new Date().toISOString(),
            isActive: true,
            totalVotes: 0
        };

        savePolls(pollsData);

        // Send poll message
        await sock.sendMessage(chatId, {
            text: pollMessage,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        });

        console.log(`✅ Poll created: ${pollId}`);

    } catch (error) {
        console.error('Error creating poll:', error);
        throw error;
    }
}

// Vote in poll
async function voteInPoll(sock, chatId, pollNumber, voterId, message) {
    try {
        const pollsData = initPolls();
        const activePolls = Object.entries(pollsData.polls).filter(([_, poll]) => 
            poll.chatId === chatId && poll.isActive
        );

        if (activePolls.length === 0) {
            await sock.sendMessage(chatId, {
                text: '❌ No active polls in this group!',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }

        // Get the latest active poll
        const [pollId, poll] = activePolls[activePolls.length - 1];
        const optionIndex = poll.options.findIndex(opt => opt.number === pollNumber);

        if (optionIndex === -1) {
            await sock.sendMessage(chatId, {
                text: `❌ Invalid option number! Valid options: ${poll.options.map(opt => opt.number).join(', ')}`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }

        // Check if user already voted
        const hasVoted = poll.options.some(opt => opt.voters.includes(voterId));
        if (hasVoted) {
            await sock.sendMessage(chatId, {
                text: '❌ You have already voted in this poll!',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }

        // Remove from previous vote if any (for vote change)
        poll.options.forEach(opt => {
            const voterIndex = opt.voters.indexOf(voterId);
            if (voterIndex > -1) {
                opt.voters.splice(voterIndex, 1);
                opt.votes--;
                poll.totalVotes--;
            }
        });

        // Add new vote
        poll.options[optionIndex].votes++;
        poll.options[optionIndex].voters.push(voterId);
        poll.totalVotes++;

        savePolls(pollsData);

        await sock.sendMessage(chatId, {
            text: `✅ Vote recorded! You voted for option ${pollNumber}: ${poll.options[optionIndex].text}`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        });

    } catch (error) {
        console.error('Error voting:', error);
        throw error;
    }
}

// Show poll results
async function showPollResults(sock, chatId) {
    try {
        const pollsData = initPolls();
        const activePolls = Object.entries(pollsData.polls).filter(([_, poll]) => 
            poll.chatId === chatId && poll.isActive
        );

        if (activePolls.length === 0) {
            await sock.sendMessage(chatId, {
                text: '❌ No active polls in this group!',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }

        const [pollId, poll] = activePolls[activePolls.length - 1];
        
        let resultsMessage = `📊 *POLL RESULTS* 📊\n\n`;
        resultsMessage += `*Question:* ${poll.question}\n\n`;
        resultsMessage += `*Results:*\n`;

        poll.options.forEach(option => {
            const percentage = poll.totalVotes > 0 
                ? Math.round((option.votes / poll.totalVotes) * 100) 
                : 0;
            
            const bars = '█'.repeat(Math.round(percentage / 10)) + '░'.repeat(10 - Math.round(percentage / 10));
            
            resultsMessage += `${option.number}️⃣ ${option.text}\n`;
            resultsMessage += `${bars} ${percentage}% (${option.votes} votes)\n\n`;
        });

        resultsMessage += `*Total Votes:* ${poll.totalVotes}\n`;
        resultsMessage += `*Poll ID:* ${pollId}\n`;
        resultsMessage += `*Status:* ${poll.isActive ? '🟢 Active' : '🔴 Closed'}`;

        await sock.sendMessage(chatId, {
            text: resultsMessage,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        });

    } catch (error) {
        console.error('Error showing results:', error);
        throw error;
    }
}

// End poll
async function endPoll(sock, chatId, enderId) {
    try {
        const pollsData = initPolls();
        const activePolls = Object.entries(pollsData.polls).filter(([_, poll]) => 
            poll.chatId === chatId && poll.isActive
        );

        if (activePolls.length === 0) {
            await sock.sendMessage(chatId, {
                text: '❌ No active polls to end!',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }

        const [pollId, poll] = activePolls[activePolls.length - 1];

        // Check if user is poll creator or admin
        if (poll.createdBy !== enderId) {
            await sock.sendMessage(chatId, {
                text: '❌ Only the poll creator can end this poll!',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }

        poll.isActive = false;
        savePolls(pollsData);

        // Find winner
        const winner = poll.options.reduce((prev, current) => 
            (prev.votes > current.votes) ? prev : current
        );

        let endMessage = `🏁 *POLL ENDED* 🏁\n\n`;
        endMessage += `*Question:* ${poll.question}\n\n`;
        endMessage += `🎉 *Winner:* Option ${winner.number} - ${winner.text}\n`;
        endMessage += `🏆 *Votes:* ${winner.votes}\n\n`;
        endMessage += `*Final Results:*\n`;

        poll.options.forEach(option => {
            const percentage = poll.totalVotes > 0 
                ? Math.round((option.votes / poll.totalVotes) * 100) 
                : 0;
            endMessage += `${option.number}️⃣ ${option.text}: ${percentage}% (${option.votes} votes)\n`;
        });

        endMessage += `\n*Total Votes:* ${poll.totalVotes}`;

        await sock.sendMessage(chatId, {
            text: endMessage,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        });

    } catch (error) {
        console.error('Error ending poll:', error);
        throw error;
    }
}

// Main poll command
async function pollCommand(sock, chatId, message) {
    try {
        const userMessage = message.message?.conversation?.trim() || 
                          message.message?.extendedTextMessage?.text?.trim() || '';
        const args = userMessage.split(' ').slice(1);
        const senderId = message.key.participant || message.key.remoteJid;

        // Show help if no arguments
        if (args.length === 0) {
            await sock.sendMessage(chatId, {
                text: `📊 *POLL SYSTEM* 📊\n\n*Commands:*\n• .poll create "Question" | Option1 | Option2 | ...\n• .vote <number> - Vote in active poll\n• .poll results - Show current results\n• .poll end - End active poll\n• .poll help - Show this menu\n\n*Examples:*\n• .poll create "Best programming language?" | JavaScript | Python | Java | C++\n• .vote 2\n• .poll results\n• .poll end\n\n*Note:* Polls only work in groups!`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }

        const action = args[0].toLowerCase();

        switch (action) {
            case 'create':
                if (args.length < 2) {
                    await sock.sendMessage(chatId, {
                        text: '❌ Usage: .poll create "Question" | Option1 | Option2 | Option3 ...',
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363420618370733@newsletter',
                                newsletterName: 'WALLYJAYTECH-MD BOTS',
                                serverMessageId: -1
                            }
                        }
                    });
                    return;
                }

                const pollText = args.slice(1).join(' ');
                const parts = pollText.split('|').map(part => part.trim());
                
                if (parts.length < 3) {
                    await sock.sendMessage(chatId, {
                        text: '❌ Format: .poll create "Question" | Option1 | Option2 | ... (min 2 options)',
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363420618370733@newsletter',
                                newsletterName: 'WALLYJAYTECH-MD BOTS',
                                serverMessageId: -1
                            }
                        }
                    });
                    return;
                }

                const question = parts[0].replace(/["']/g, '');
                const options = parts.slice(1);

                await createPoll(sock, chatId, question, options, message);
                break;

            case 'results':
                await showPollResults(sock, chatId);
                break;

            case 'end':
                await endPoll(sock, chatId, senderId);
                break;

            case 'help':
                await sock.sendMessage(chatId, {
                    text: `🆘 *POLL HELP* 🆘\n\n*Create Poll:*\n.poll create "Your question?" | Option 1 | Option 2 | Option 3\n\n*Vote:*\n.vote <number> - Vote for an option\n\n*View Results:*\n.poll results - See current results\n\n*End Poll:*\n.poll end - Close the poll (creator only)\n\n*Example:*\n.poll create "Favorite color?" | Red | Blue | Green | Yellow\n.vote 2\n.poll results\n.poll end`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363420618370733@newsletter',
                            newsletterName: 'WALLYJAYTECH-MD BOTS',
                            serverMessageId: -1
                        }
                    }
                });
                break;

            default:
                await sock.sendMessage(chatId, {
                    text: '❌ Invalid poll command! Use .poll help for usage.',
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363420618370733@newsletter',
                            newsletterName: 'WALLYJAYTECH-MD BOTS',
                            serverMessageId: -1
                        }
                    }
                });
                break;
        }

    } catch (error) {
        console.error('Error in poll command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Error processing poll command!',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        });
    }
}

// Vote command
async function voteCommand(sock, chatId, message) {
    try {
        const userMessage = message.message?.conversation?.trim() || 
                          message.message?.extendedTextMessage?.text?.trim() || '';
        const args = userMessage.split(' ').slice(1);
        const senderId = message.key.participant || message.key.remoteJid;

        if (args.length === 0) {
            await sock.sendMessage(chatId, {
                text: '❌ Usage: .vote <option-number>\n\nExample: .vote 2',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }

        const voteNumber = parseInt(args[0]);
        
        if (isNaN(voteNumber) || voteNumber < 1) {
            await sock.sendMessage(chatId, {
                text: '❌ Please provide a valid option number!',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }

        await voteInPoll(sock, chatId, voteNumber, senderId, message);

    } catch (error) {
        console.error('Error in vote command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Error processing vote!',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        });
    }
}

module.exports = {
    pollCommand,
    voteCommand
};
