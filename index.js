const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config(); // load .env variables

const url = process.env.MONGO_URI ;

const app = express();

// Connect to MongoDB
mongoose.connect(url)
const con = mongoose.connection;

con.on('open', () => {
    console.log('Connected to MongoDB...');
});

app.use(express.json());

const authRouter = require('../FindItHub-backend/routes/auth.routes');
app.use('/auth', authRouter);

app.listen(9000, () => {
    console.log('Server started at Port 9000!');
});
