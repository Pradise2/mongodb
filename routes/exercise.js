const router = require('express').Router();
let Exercise = require('../models/exercise.model');

// Get all exercises
router.route('/').get((req, res) => {
    Exercise.find()
    .then(exercises => res.json(exercises))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Add a new exercise
router.route('/add').post((req, res) => {
    const { username, description, duration, date } = req.body;
    const newExercise = new Exercise({
        username,
        description,
        duration: Number(duration),
        date: Date.parse(date)
    });

    newExercise.save()
    .then(() => res.json('Exercise added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Get exercises by username
router.route('/:username').get((req, res) => {
    Exercise.find({ username: req.params.username })
    .then(exercises => res.json(exercises))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Delete exercise by username
router.route('/:username').delete((req, res) => {
    Exercise.findOneAndDelete({ username: req.params.username })
    .then(() => res.json('Exercise deleted'))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Update exercise by username
router.route('/update/:username').post((req, res) => {
    Exercise.findOne({ username: req.params.username })
    .then(exercise => {
        exercise.username = req.body.username;
        exercise.description = req.body.description;
        exercise.duration = Number(req.body.duration);
        exercise.date = Date.parse(req.body.date);

        exercise.save()
        .then(() => res.json('Exercise updated'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
