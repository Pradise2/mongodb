const mongoose = require('mongoose');
const { Schema } = mongoose;

const tasksSchema = new Schema({
    id: {
        type: Number,
        required: true,
        default: 0
    },
    name: {
        type: String,
        required: true,
        default: "Start"
    },
    status: {
        type: String,
        default: 'claim'
    },
    reward: {
        type: Number,
        default: 0
    },
    link: { // Add this line
        type: String,
        // Make it required if it should always be present
    }
});

const taskSchema = new Schema({
    userId: { type: String, required: true },
    username: { type: String },
    tasks: [tasksSchema]
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
