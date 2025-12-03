const express = require("express");

const validatesignup = require("../utils/validate")

const bcrypt = require("bcrypt")

const authRouter = express.Router();

const User = require("../models/user");

const jwt = require("jsonwebtoken")

//uploads signup data to the database
authRouter.post("/signup", async (req,res) => {
  try{

  validatesignup(req.body)

  const{FirstName,LastName,Email,Password,Age,Gender} = req.body;

  const EncPassword = await bcrypt.hash(Password,10);

  const user = new User({FirstName,LastName,Email,Password:EncPassword,Age,Gender})
  
    await user.save();
    res.send("data saved successfully")
  }
  catch(err){
    res.status(500).send("Failed to save data"+ err.message);

  }
})

// login user
authRouter.post("/login", async (req, res) => {
  try {
    const { Email, Password } = req.body;

    const user = await User.findOne({ Email });
    if (!user) throw new Error("Invalid Credentials");

    const passcheck = await bcrypt.compare(Password, user.Password);
    if (!passcheck) throw new Error("Invalid Credentials");

    const token = await user.getJWT();

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});


  //logout
  authRouter.post("/logout",(req,res) => {
    res.cookie("token","",{expires:new Date (0)});
    res.send("logged out successfully")
  })

module.exports = authRouter;