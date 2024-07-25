const router = require('express').Router();
let Home = require('../models/home.model');

// Get all homes
router.route('/').get((req, res) => {
    Home.find()
        .then(homes => res.json(homes))
        .catch(err => res.status(400).json('Error: ' + err));
});

// Add a new home
router.route('/add').post(async (req, res) => {
    const { username, userId, homeBalance, tapClaim, tapPoint, tapTime, LastActiveTime } = req.body;

    console.log('Received request to add home:', req.body);

    try {
        const existingHome = await Home.findOne({ userId });
        if (existingHome) {
            console.log('Home already exists for userId:', userId);
            return res.status(409).json('Home already exists');
        }

        const newHome = new Home({
            username,
            userId,
            homeBalance,
            tapClaim,
            tapPoint,
            tapTime,
            LastActiveTime
        });

        await newHome.save();
        console.log('New home added:', newHome);
        res.status(201).json('Home added!');
    } catch (err) {
        console.error('Error adding home:', err);
        res.status(400).json({ error: err.message });
    }
});

// Get homes by userId
router.route('/:userId').get((req, res) => {
    console.log('Received request to get home by userId:', req.params.userId);

    Home.find({ userId: req.params.userId })
        .then(homes => {
            if (homes.length === 0) {
                console.log('Home not found for userId:', req.params.userId);
                return res.status(404).json('Home not found');
            }
            console.log('Found homes for userId:', homes);
            res.json(homes);
        })
        .catch(err => {
            console.error('Error fetching home by userId:', err);
            res.status(400).json('Error: ' + err);
        });
});

// Delete home by userId
router.route('/:userId').delete((req, res) => {
    Home.findOneAndDelete({ userId: req.params.userId })
        .then(home => {
            if (!home) {
                console.log('Home not found for deletion, userId:', req.params.userId);
                return res.status(404).json('Home not found');
            }
            console.log('Deleted home for userId:', req.params.userId);
            res.json('Home deleted');
        })
        .catch(err => {
            console.error('Error deleting home by userId:', err);
            res.status(400).json('Error: ' + err);
        });
});

// Express route to update home balance
router.route('/updateBalance/:userId').post((req, res) => {
    Home.findOne({ userId: req.params.userId })
        .then(home => {
            if (!home) {
                console.log('Home not found for updateBalance, userId:', req.params.userId);
                return res.status(404).json('Home not found');
            }

            // Assuming req.body.amount contains the reward to be added
            const { amount } = req.body;

            // Update the homeBalance
            home.homeBalance += amount;

            home.save()
                .then(() => {
                    console.log('Updated home balance for userId:', req.params.userId);
                    res.json({ homeBalance: home.homeBalance });
                })
                .catch(err => {
                    console.error('Error updating home balance by userId:', err);
                    res.status(400).json('Error: ' + err);
                });
        })
        .catch(err => {
            console.error('Error finding home by userId for balance update:', err);
            res.status(400).json('Error: ' + err);
        });
});

// Update home by userId
router.route('/updateBalance/:userId').post(async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount } = req.body;

        // Validate the amount
        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        // Find the home document by userId
        const home = await Home.findOne({ userId });
        if (!home) {
            console.log('Home not found for updateBalance, userId:', userId);
            return res.status(404).json({ message: 'Home not found' });
        }

        // Update the homeBalance
        home.homeBalance += amount;
        await home.save();

        console.log('Updated home balance for userId:', userId, 'New balance:', home.homeBalance);
        res.json({ homeBalance: home.homeBalance });

    } catch (err) {
        console.error('Error updating home balance for userId:', req.params.userId, 'Error:', err);
        res.status(500).json({ message: 'Error updating home balance', error: err.message });
    }
});



module.exports = router;
