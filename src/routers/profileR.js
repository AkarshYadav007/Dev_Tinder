const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userAuth = require("../middlewares/auth");
const User = require("../models/user");

const upload = require("../middlewares/multer");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary");

const profileRouter = express.Router();

/* ------------------ CORS PREFLIGHT ------------------ */
profileRouter.options("/profile/edit", (req, res) => {
  res.sendStatus(200);
});

/* ------------------ VIEW PROFILE ------------------ */
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  res.json(req.userdata);
});

/* ------------------ EDIT PROFILE ------------------ */
profileRouter.patch(
  "/profile/edit",
  userAuth,
  upload.single("photo"),
  async (req, res) => {
    try {
      const allowedKeys = ["Gender", "Age", "about"];
      const updates = {};

      // Validate allowed fields
      Object.keys(req.body).forEach((key) => {
        if (!allowedKeys.includes(key)) {
          throw new Error("Update not allowed");
        }
        updates[key] = req.body[key];
      });

      // Upload photo to Cloudinary (NO local files)
      if (req.file) {
        const uploadResult = await uploadToCloudinary(req.file.buffer);

        if (!uploadResult) {
          throw new Error("Image upload failed");
        }

        // Optional: delete old image
        if (req.userdata.photoPublicId) {
          await deleteFromCloudinary(req.userdata.photoPublicId);
        }

        updates.photo = uploadResult.secure_url;
        updates.photoPublicId = uploadResult.public_id;
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.userdata._id,
        updates,
        { new: true, runValidators: true }
      );

      res.json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (err) {
      res.status(400).json({
        message: "UPDATE FAILED",
        error: err.message,
      });
    }
  }
);

/* ------------------ CHANGE PASSWORD ------------------ */
profileRouter.patch("/profile/changepassword", userAuth, async (req, res) => {
  try {
    if (!req.body.Password) {
      throw new Error("Password is required");
    }

    const hashedPassword = await bcrypt.hash(req.body.Password, 10);

    await User.findByIdAndUpdate(
      req.userdata._id,
      { Password: hashedPassword },
      { runValidators: true }
    );

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(400).json({
      message: "Password update failed",
      error: err.message,
    });
  }
});

module.exports = profileRouter;
