const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const app = express();

// ======================
// 🔥 MongoDB Connection (CACHED)
// ======================
const MONGO_URI = process.env.MONGO_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then((mongoose) => {
      console.log("✅ MongoDB Connected");
      return mongoose;
    }).catch(err => {
      console.error("❌ MongoDB connection error:", err);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// ======================
// 🔥 Middleware
// ======================
const allowedOrigins = [
  "http://localhost:3000",
  "https://find-it-hub.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

app.use(express.json());

// ======================
// 🔥 Ensure DB before every request
// ======================
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Database connection failed",
      error: err.message
    });
  }
});

// ======================
// 🔥 Static Files
// ======================
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// ======================
// 🔥 Routes
// ======================
const authRouter = require("../routes/auth.routes");
const itemRoutes = require("../routes/item.routes");
const commentRoutes = require("../routes/comment.routes");
const uploadRoutes = require("../routes/upload.routes");

app.use("/auth", authRouter);
app.use("/items", itemRoutes);
app.use("/items", commentRoutes);
app.use("/upload", uploadRoutes);

// ======================
// ❌ REMOVE app.listen()
// ======================
// Vercel needs export, not a running server

module.exports = app;