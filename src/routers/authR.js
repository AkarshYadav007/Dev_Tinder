const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const validateSignup = require("../utils/validate");
const User = require("../models/user");

const authRouter = express.Router();

/* ---------------- COOKIE OPTIONS ---------------- */
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: "strict", // stricter than lax
  maxAge: 60 * 60 * 1000, // 1 hour
};

/* ---------------- SIGNUP ---------------- */
authRouter.post("/signup", async (req, res) => {
  try {
    validateSignup(req.body);

    const { FirstName, LastName, Email, Password } = req.body;

    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = new User({
      FirstName,
      LastName,
      Email,
      Password,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    res.cookie("token", token, cookieOptions);

    // ✅ RETURN FULL USER (NO PASSWORD)
    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: savedUser._id,
        FirstName: savedUser.FirstName,
        LastName: savedUser.LastName,
        Email: savedUser.Email,
        Age: savedUser.Age,
        Gender: savedUser.Gender,
        photo: savedUser.photo,
        about: savedUser.about,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Signup failed",
      error: err.message,
    });
  }
});


/* ---------------- LOGIN ---------------- */
authRouter.post("/login", async (req, res) => {
  try {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
      return res.status(400).json({ message: "Email and Password required" });
    }

    // Fetch password only for comparison
    const user = await User.findOne({ Email }).select("+Password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(Password, user.Password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = await user.getJWT();
    res.cookie("token", token, cookieOptions);

    // ✅ RETURN FULL USER (NO PASSWORD)
    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.Email,
        Age: user.Age,
        Gender: user.Gender,
        photo: user.photo,
        about: user.about,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Login failed",
      error: err.message,
    });
  }
});


/* ---------------- LOGOUT ---------------- */
authRouter.post("/logout", (req, res) => {
  // Clear cookie
  res.clearCookie("token", cookieOptions);
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = authRouter;
