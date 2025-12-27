require("dotenv").config(); // Load .env variables
require("./utils/cronJob")

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http")
 
const connection = require("./config/database");
const User = require("./models/user");

const authRouter = require("./routers/authR");
const profileRouter = require("./routers/profileR");
const requestRouter = require("./routers/requestR");
const userRouter = require("./routers/userR");
const initializeSocket = require("./utils/socket")

const userAuth = require("./middlewares/auth");
const chatRouter = require("./routers/chatR");

const app = express();
const PORT = process.env.PORT || 3000;

/* ------------------ CORS ------------------ */
const allowedOrigins = [
  "http://localhost:5173",
  "https://devmeet.online",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/* ------------------ MIDDLEWARES ------------------ */
app.use(express.json());
app.use(cookieParser());

/* ------------------ ROUTES ------------------ */
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/",chatRouter);

const server = http.createServer(app);
initializeSocket(server);

/* ------------------ FEED ------------------ */
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({}).select("-Password -__v"); // Exclude sensitive fields
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch feed", error: err.message });
  }
});

/* ------------------ DELETE USER (SECURED) ------------------ */
app.delete("/delete", userAuth, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // Ensure user can only delete their own account (or admin logic)
    if (req.userdata._id.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden: cannot delete other users" });
    }

    await User.findByIdAndDelete(userId);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

/* ------------------ GLOBAL ERROR HANDLER ------------------ */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

/* ------------------ START SERVER ------------------ */
connection()
  .then(() => {
    console.log("✅ Database connected successfully");
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed", err.message);
    process.exit(1);
  });
