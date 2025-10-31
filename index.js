const express = require('express');
const mongoose = require('mongoose');
const url = 'mongodb://localhost/credenceDB';

const app = express();

mongoose.connect(url)
const con = mongoose.connection;

con.on('open', () => {
    console.log('connected...');
})

app.use(express.json());

const dataRouter = require('../FindItHub-backend/routes/data.routes');
app.use('/data',dataRouter);

app.listen(9000, ()=> {
    console.log('Server Started at Port 9000!');
})