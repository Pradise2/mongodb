const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Telegraf } = require('telegraf');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/yourDatabaseName';

app.use(cors());
app.use(express.json());

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
});

const exerciseRouter = require('./routes/exercise');
const usersRouter = require('./routes/users'); 
const homeRouter = require('./routes/home');
const farmRouter = require('./routes/farm');
const squadRouter = require('./routes/squad');
const taskRouter = require('./routes/task');
const bot = require('./bot/bot');
const farmpageRouter = require('./routes/farmpage');

app.use('/exercise', exerciseRouter);
app.use('/users', usersRouter);
app.use('/home', homeRouter);
app.use('/farm', farmRouter);
app.use('/squad', squadRouter);
app.use('/task', taskRouter);
app.use('/farmpage', farmpageRouter); 

// Launch the bot
bot.launch()
    .then(() => console.log('Bot is running...'))
    .catch(error => console.error('Error launching bot:', error));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});
