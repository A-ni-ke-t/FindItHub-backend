const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // load .env variables
const path = require("path");

const url = process.env.MONGO_URI;

const app = express();

// Enable CORS BEFORE defining routes
app.use(cors({
    origin: "http://localhost:3000", // React app
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(url);
const con = mongoose.connection;
con.on('open', () => {
    console.log('Connected to MongoDB...');
});

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Routes
const authRouter = require('./routes/auth.routes');
const itemRoutes = require("./routes/item.routes");
const commentRoutes = require("./routes/comment.routes");
const uploadRoutes = require("./routes/upload.routes");


app.use('/auth', authRouter);
app.use("/items", itemRoutes);
app.use("/items", commentRoutes); 
app.use("/upload", uploadRoutes); 

app.listen(9000, () => {
    console.log('Server started at Port 9000!');
});
