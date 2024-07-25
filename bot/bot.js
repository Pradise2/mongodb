const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const Home = require('../models/home.model');
const Squad = require('../models/squad.model');
const Farm = require('../models/farm.model'); // Import Farm model
const Task = require('../models/task.model'); // Import Task model


const token = process.env.TOKEN || '7233165030:AAEO2yudL-ypxo3k3Z1fyxeld25XeS39JWc';
const bot = new Telegraf(token);
const web_link ='https://thelun.vercel.app/';

// Start Handler
bot.start(async (ctx) => {
    try {
        const startPayload = ctx.startPayload || '';
        const userId = ctx.chat.id;
        const urlSent = `${web_link}?ref=${startPayload}&userId=${userId}`;
        const user = ctx.message.from;
        const userName = user.username ? `@${user.username.replace(/[-.!]/g, '\\$&')}` : user.first_name;

        const messageText = `
*Welcome 🎉, ${userName}* Future Astronaut!.

You are ready to explore the Moon like never before! 🚀

🤩Lunar tap-to-earn game has just touched down on Telegram! Get set to be amazed! 🤩

🤑 Earn Lunar tokens, tackle epic challenges, and uncover incredible rewards. 

🔗 Team up for greater glory! Invite your friends to double the fun and double the tokens! 

🌔 Lunar isn't just a game, it's your gateway to building a thriving lunar colony. 

🧠 Strategize, 🌍 explore, and 💰 earn all from your Telegram app.

*🚀Your Lunar adventure starts now!🚀*
        `;

        await ctx.replyWithMarkdown(messageText, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Start Now", web_app: { url: urlSent } }]
                ]
            },
        });

        if (startPayload.startsWith('ref_')) {
            const refUserId = startPayload.split('_')[1];
            await storeReferral(refUserId, userId, userName);
        }
    } catch (error) {
        console.error('Error in start handler:', error);
    }
});

// Referral Command Handler
bot.command('referral', async (ctx) => {
    const userId = ctx.from.id;
    try {
        const squad = await Squad.findOne({ userId });
        if (!squad) {
            const referralCode = Math.random().toString(36).substring(7);
            await Squad.create({ userId, username: ctx.from.username, claimedReferral: 0 });
            await Home.create({ userId, homeBalance: 0, username: ctx.from.username });            
            ctx.reply(`Your referral code is: ${referralCode}`);
        } else {
            ctx.reply('You already have a referral code.');
        }
    } catch (error) {
        console.error('Error generating referral code:', error);
        ctx.reply('There was an error generating your referral code. Please try again.');
    }
});

// Store Referral
const storeReferral = async (refUserId, newUserId, newUserName) => {
    if (!refUserId || refUserId === newUserId.toString()) return;

    try {
        const newUserDoc = await Squad.findOne({ userId: newUserId });
        if (!newUserDoc) {
            await Squad.create({ userId: newUserId, username: newUserName });
        }

        const referralDoc = await Squad.findOne({ userId: refUserId });
        if (!referralDoc) return;

        if (!referralDoc.newUserIds.includes(newUserId)) {
            referralDoc.newUserIds.push(newUserId);
            referralDoc.claimedReferral += 1;

            const homeDoc = await Home.findOne({ userId: newUserId });
            const homeBalance = homeDoc?.homeBalance || 0;

            const totalReferralBonus = homeBalance * 0.1;
            referralDoc.referralEarning += totalReferralBonus;

            referralDoc.referrals.push({
                userId: newUserId,
                username: newUserName,
                referralBonus: totalReferralBonus
            });

            await referralDoc.save();
            console.log(`Referral stored for user ${refUserId}`);
        }
    } catch (error) {
        console.error('Error storing referral:', error);
    }
};

// Update Referral Earnings on Home Balance Increase
const updateReferralBonus = async (userId, previousBalance, currentBalance) => {
    const increase = currentBalance - previousBalance;
    if (increase > 0) {
        const extraBonus = Math.floor(increase * 0.1); // 10% of the increase
        const referralDoc = await Squad.findOne({ userId });
        if (referralDoc) {
            referralDoc.referralEarning += extraBonus;
            await referralDoc.save();
            console.log(`Extra bonus of ${extraBonus} awarded to ${userId}`);
        }
    }
};



module.exports = bot;
