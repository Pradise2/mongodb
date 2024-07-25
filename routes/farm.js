const router = require('express').Router();
let Farm = require('../models/farm.model');
let Home = require('../models/home.model');

// Get all farms
router.route('/').get((req, res) => {
    Farm.find()
        .then(farms => res.json(farms))
        .catch(err => res.status(400).json('Error: ' + err));
});

// Add a new farm
router.route('/add').post(async (req, res) => {
    const { username, userId, farmReward, farmTime, LastActiveFarmTime, farmStatus, farmTotal } = req.body;
    console.log('Received request to add farm:', req.body);

    if (!userId) {
        return res.status(400).json('Error: userId is required');
    }

    try {
        const existingFarm = await Farm.findOne({ userId });
        if (existingFarm) {
            console.log('Farm already exists for userId:', userId);
            return res.status(409).json('Farm already exists');
        }

        const newFarm = new Farm({
            username,
            userId,
            farmReward,
            farmTime,
            LastActiveFarmTime,
            farmTotal: farmTotal || 0,
            farmStatus: farmStatus || 'start' // Default to 'start' if not provided
        });

        await newFarm.save();
        console.log('New farm added:', newFarm);
        res.status(201).json('Farm added!');
    } catch (err) {
        console.error('Error adding farm:', err);
        res.status(400).json({ error: err.message });
    }
});

// Get farms by userId
router.route('/:userId').get((req, res) => {
    console.log('Received request to get farm by userId:', req.params.userId);

    Farm.find({ userId: req.params.userId })
        .then(farms => {
            if (farms.length === 0) {
                console.log('Farm not found for userId:', req.params.userId);
                return res.status(404).json('Farm not found');
            }
            console.log('Found farms for userId:', farms);
            res.json(farms);
        })
        .catch(err => {
            console.error('Error fetching farm by userId:', err);
            res.status(400).json('Error: ' + err);
        });
});

// Delete farm by userId
router.route('/:userId').delete((req, res) => {
    Farm.findOneAndDelete({ userId: req.params.userId })
        .then(farm => {
            if (!farm) {
                console.log('Farm not found for deletion, userId:', req.params.userId);
                return res.status(404).json('Farm not found');
            }
            console.log('Deleted farm for userId:', req.params.userId);
            res.json('Farm deleted');
        })
        .catch(err => {
            console.error('Error deleting farm by userId:', err);
            res.status(400).json('Error: ' + err);
        });
});

// Update farm by userId
router.route('/update/:userId').post((req, res) => {
    Farm.findOne({ userId: req.params.userId })
        .then(farm => {
            if (!farm) {
                console.log('Farm not found for update, userId:', req.params.userId);
                return res.status(404).json('Farm not found');
            }

            farm.username = req.body.username || farm.username;
            farm.farmTime = req.body.farmTime || farm.farmTime;
            farm.farmReward = req.body.farmReward || farm.farmReward;
            farm.LastActiveFarmTime = req.body.LastActiveFarmTime || farm.LastActiveFarmTime;
            farm.farmStatus = req.body.farmStatus || farm.farmStatus; // Update farmStatus
            farm.farmTotal = req.body.farmTotal || farm.farmTotal; // Update farmTotal

            farm.save()
                .then(() => {
                    console.log('Updated farm for userId:', req.params.userId);
                    res.json('Farm updated');
                })
                .catch(err => {
                    console.error('Error updating farm by userId:', err);
                    res.status(400).json('Error: ' + err);
                });
        })
        .catch(err => {
            console.error('Error finding farm by userId for update:', err);
            res.status(400).json('Error: ' + err);
        });
});

// Start farming by userId
router.route('/farm/:userId/start').put(async (req, res) => {
    try {
        const farm = await Farm.findOneAndUpdate(
            { userId: req.params.userId },
            { farmStatus: 'farming', farmTime: 60, LastActiveFarmTime: Math.floor(Date.now() / 1000) },
            { new: true }
        );
        res.json(farm);
    } catch (err) {
        res.status(500).send('Error starting farming');
    }
});

// Claim reward by userId
router.route('/farm/:userId/claim').put(async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log('Claim request for userId:', userId); // Debug log

        // Find the farm document
        const farm = await Farm.findOne({ userId });
        if (!farm) {
            console.log('Farm not found for userId:', userId); // Debug log
            return res.status(404).json({ message: 'Farm not found' });
        }

        const farmReward = farm.farmReward; // use farmReward from the farm document

        // Update the farm document
        farm.farmStatus = 'start';
        farm.farmTime = 60;
        farm.farmTotal += farmReward; // Increment farmTotal
        await farm.save();

        // Find the home document by userId
        const home = await Home.findOne({ userId });
        if (!home) {
            console.log('Home not found for claim, userId:', userId);
            return res.status(404).json({ message: 'Home not found' });
        }

        // Update the home balance
        home.homeBalance += farmReward;
        await home.save();

        console.log('Updated home balance for userId:', userId, 'New balance:', home.homeBalance);
        res.json({ farm, homeBalance: home.homeBalance });

    } catch (err) {
        console.error('Error claiming reward and updating home balance for userId:', req.params.userId, 'Error:', err);
        res.status(500).json({ message: 'Error claiming reward and updating home balance', error: err.message });
    }
});

module.exports = router;
