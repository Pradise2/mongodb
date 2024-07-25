const router = require('express').Router();
let Task = require('../models/task.model');
let Home = require('../models/home.model')

// Get all tasks
router.route('/').get( async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (err) {
        res.status(400).json({ message: 'Error fetching tasks', error: err.message });
    }
});


// Add a new task
router.route('/add').post( async (req, res) => {
    const { username, userId, tasks } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    try {
        let existingTask = await Task.findOne({ userId });

        if (existingTask) {
            return res.status(409).json({ message: 'Tasks already exist for userId' });
        }

        // Define default tasks if tasks array is empty
        const defaultTasks = [
            { id: 0, name: 'Start' }
        ];

        // Create a new task with default tasks
        const newTask = new Task({ 
            username,
            userId,
            tasks: tasks.length > 0 ? tasks : defaultTasks 
        });

        await newTask.save();
        res.status(201).json({ message: 'Tasks added', task: newTask });
    } catch (err) {
        res.status(400).json({ message: 'Error adding tasks', error: err.message });
    }
});


// Add multiple tasks programmatically
router.route('/addTasks').post(async (req, res) => {
    const { userId, tasks } = req.body;

    if (!userId || !Array.isArray(tasks) || tasks.length === 0) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    try {
        for (const task of tasks) {
            await Task.updateOne(
                { userId, 'tasks.id': { $ne: task.id } },
                { $addToSet: { tasks: task } }
            );
        }

        const updatedUser = await Task.findOne({ userId });
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error adding tasks:', error);
        res.status(500).json({ message: 'Error adding tasks', error });
    }
});

// Get tasks by userId
router.route('/:userId').get(async (req, res) => {
    const { userId } = req.params;

    try {
        const task = await Task.findOne({ userId });
        if (!task) {
            return res.status(404).json({ message: 'Tasks not found for userId' });
        }
        res.json(task);
    } catch (err) {
        res.status(400).json({ message: 'Error fetching tasks by userId', error: err.message });
    }
});

// Delete tasks by userId
router.route('/:userId').delete( async (req, res) => {
    const { userId } = req.params;

    try {
        const task = await Task.findOneAndDelete({ userId });
        if (!task) {
            return res.status(404).json({ message: 'Tasks not found for deletion' });
        }
        res.json({ message: 'Tasks deleted' });
    } catch (err) {
        res.status(400).json({ message: 'Error deleting tasks by userId', error: err.message });
    }
});


// Define status stages
const STATUS_STAGES = ['start', 'claim', 'complete'];

// Endpoint to update task status
router.route('/updateStatus').post(async (req, res) => {
    const { userId, taskId } = req.body;

    if (!userId || !taskId) {
        return res.status(400).json({ message: 'Invalid input: userId and taskId are required' });
    }

    try {
        const task = await Task.findOne({ userId, 'tasks._id': taskId });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const taskToUpdate = task.tasks.id(taskId);
        if (!taskToUpdate) {
            return res.status(404).json({ message: 'Task not found in the user’s tasks' });
        }

        const currentStatusIndex = STATUS_STAGES.indexOf(taskToUpdate.status);
        const nextStatus = STATUS_STAGES[(currentStatusIndex + 1) % STATUS_STAGES.length];

        // Check if the status is already 'complete'
        if (taskToUpdate.status === 'complete') {
            return res.status(400).json({ message: 'Task is already complete' });
        }

        taskToUpdate.status = nextStatus;

        await task.save();

        // Update home balance only if the next status is 'complete'
        if (nextStatus === 'complete') {
            const home = await Home.findOne({ userId });
            if (home) {
                home.homeBalance += taskToUpdate.reward;
                await home.save();
                console.log(`Home balance updated: ${home.homeBalance}`);
            }
        }

        res.json({ message: 'Task status updated', task: taskToUpdate });
    } catch (err) {
        console.error('Error in /updateStatus route:', err);
        res.status(500).json({ message: 'Error updating task status', error: err.message });
    }
});



// Update tasks by userId
router.route('/update/:userId').put (async (req, res) => {
    const { userId } = req.params;
    const { username, tasks } = req.body;

    if (!username || !Array.isArray(tasks)) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    try {
        const task = await Task.findOne({ userId });
        if (!task) {
            return res.status(404).json({ message: 'Tasks not found for update' });
        }

        task.username = username;
        task.tasks = tasks;

        await task.save();
        res.json({ message: 'Tasks updated', task });
    } catch (err) {
        res.status(400).json({ message: 'Error updating tasks by userId', error: err.message });
    }
});

module.exports = router;
