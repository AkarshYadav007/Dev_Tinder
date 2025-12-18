const multer = require("multer");

/**
 * Multer configuration
 * - Uses memory storage (NO local files)
 * - Safe for PM2, Docker, Cloud, scaling
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only image files are allowed"), false);
    }

    cb(null, true);
  },
});

module.exports = upload;
