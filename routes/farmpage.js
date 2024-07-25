const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Home = require('../models/home.model');
const Farm = require('../models/farm.model');

// New route to update farm and homeBalance
router.route('/update-farm-and-home/:userId').post(async (req, res) => {
    const { farmReward, farmTime, LastActiveFarmTime } = req.body;
    const userId = req.params.userId;

    try {
        // Fetch the farm by userId
        let farm = await Farm.findOne({ userId });
        
        // If the farm does not exist, create a new one
        if (!farm) {
            console.log('Farm not found for userId:', userId, 'Creating a new farm');
            farm = new Farm({
                userId,
                farmReward: farmReward || 0, // Initialize with provided or default values
                farmTime: farmTime || 60,
                LastActiveFarmTime: LastActiveFarmTime || Math.floor(Date.now() / 1000)
            });
        } else {
            // If the farm exists, update it
            farm.farmTime = farmTime;
            farm.farmReward = farmReward;
            farm.LastActiveFarmTime = LastActiveFarmTime;
        }
        
        // Save the farm
        await farm.save();
        console.log('Updated/Created farm for userId:', userId);

        // Fetch and update the home balance
        const home = await Home.findOne({ userId });
        if (!home) {
            console.log('Home not found for update, userId:', userId);
            return res.status(404).json('Home not found');
        }

        home.homeBalance += farmReward;
        await home.save();
        console.log('Updated home balance for userId:', userId);

        // Respond with the updated home balance
        res.json({ updatedHomeBalance: home.homeBalance });
    } catch (err) {
        console.error('Error updating farm and home balance:', err);
        res.status(400).json('Error: ' + err.message);
    }
});

module.exports = router;
