const router = require('express').Router();
let Squad = require('../models/squad.model');

// Get all squads
router.route('/').get((req, res) => {
    Squad.find()
        .then(squads => res.json(squads))
        .catch(err => res.status(400).json('Error: ' + err));
});

// Add a new squad
router.route('/add').post( async (req, res) => {
    const { username, userId, claimedReferral, newUserIds, referralEarning, referrals, totalBalance } = req.body;
    if (!userId) {
        return res.status(400).json({ message: 'Invalid input' });
    }
    try {
        let existingTask = await Squad.findOne({ userId });

        if (existingTask) {
            return res.status(409).json({ message: 'Tasks already exist for userId' });
        }
        

    const newSquad = new Squad({
        username,
        userId,
        claimedReferral,
        newUserIds,
        referralEarning,
        referrals,
        totalBalance
    });

       await newSquad.save();
        res.status(201).json({ message: 'Tasks added', task: newTask });
    } catch (err) {
        res.status(400).json({ message: 'Error adding tasks', error: err.message });
    }
});

// Get squads by userId
router.route('/:userId').get((req, res) => {
    Squad.find({ userId: req.params.userId })
        .then(squads => res.json(squads))
        .catch(err => res.status(400).json('Error: ' + err));
});

// Delete squad by userId
router.route('/:userId').delete((req, res) => {
    Squad.findOneAndDelete({ userId: req.params.userId })
        .then(() => res.json('Squad deleted'))
        .catch(err => res.status(400).json('Error: ' + err));
});

// Update squad by userId
router.route('/update/:userId').post((req, res) => {
    Squad.findOne({ userId: req.params.userId })
        .then(squad => {
            if (!squad) return res.status(404).json('Squad not found');

            squad.username = req.body.username;
            squad.userId = req.body.userId;
            squad.claimedReferral = req.body.claimedReferral;
            squad.newUserIds = req.body.newUserIds;
            squad.referralEarning = req.body.referralEarning;
            squad.referrals = req.body.referrals;
            squad.totalBalance = req.body.totalBalance;

            squad.save()
                .then(() => res.json('Squad updated'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
