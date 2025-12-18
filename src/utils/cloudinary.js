/**
 * cloudinary.js
 * Production-safe Cloudinary configuration + upload helpers
 */

const cloudinary = require("cloudinary").v2;

/* ------------------ CONFIG ------------------ */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Always return HTTPS URLs
});

/* ------------------ UPLOAD FROM BUFFER ------------------ */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "image",
          folder: "profile_photos",
          transformation: [
            { width: 500, height: 500, crop: "fill", gravity: "face" },
            { quality: "auto", fetch_format: "auto" },
          ],
          ...options,
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      )
      .end(buffer);
  });
};

/* ------------------ DELETE IMAGE ------------------ */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  return cloudinary.uploader.destroy(publicId);
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
};
