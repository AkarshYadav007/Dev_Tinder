const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const validateSignup = require("../utils/validate");
const User = require("../models/user");

const authRouter = express.Router();

/**
 * Helper: cookie options for production
 */
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: "strict",
  maxAge: 60 * 60 * 1000, // 1 hour
};

/**
 * SIGNUP
 */
authRouter.post("/signup", async (req, res) => {
  try {
    validateSignup(req.body);

    const { FirstName, LastName, Email, Password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(Password, 12);

    const user = new User({
      FirstName,
      LastName,
      Email,
      Password: hashedPassword,
    });

    const savedUser = await user.save();

    const token = await savedUser.getJWT();

    res.cookie("token", token, cookieOptions);

    // Never return password
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: savedUser._id,
        FirstName: savedUser.FirstName,
        LastName: savedUser.LastName,
        Email: savedUser.Email,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Signup failed",
      error: err.message,
    });
  }
});

/**
 * LOGIN
 */
authRouter.post("/login", async (req, res) => {
  try {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
      return res.status(400).json({ message: "Email and Password required" });
    }

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

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.Email,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Login failed",
      error: err.message,
    });
  }
});

/**
 * LOGOUT
 */
authRouter.post("/logout", (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = authRouter;
