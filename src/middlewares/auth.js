

const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    // ALLOW CORS PREFLIGHT OPTIONS REQUESTS
    if (req.method === "OPTIONS") {
      return next();
    }

    const { token } = req.cookies;
    if (!token) {
      throw new Error("Please Login first");
    }

    const decodedmessage = await jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = decodedmessage;

    const userdata = await User.findById(_id);
    req.userdata = userdata;

    next();
  } catch (err) {
    res.status(401).send("ERROR:" + err.message);
  }
};

module.exports = userAuth;
