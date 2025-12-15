const express = require("express");

const userAuth = require("../middlewares/auth")

const profileRouter = express.Router();

const jwt = require("jsonwebtoken");

const User = require("../models/user");

const bcrypt = require("bcrypt")

const upload = require("../middlewares/multer")

const uploadOnCloudinary = require("../utils/cloudinary.js")

profileRouter.options("/profile/edit", (req, res) => {
  res.sendStatus(200);
});

//gets the user profile 
profileRouter.get("/profile/view",userAuth,async (req,res) => 
  
  {  res.send(req.userdata);
  }
  )

profileRouter.patch("/profile/edit",upload.fields([{name:"photo",maxCount:1}]),async (req,res) => 
    {
        try{const allowedkeys = ["Gender","Age","photo","about"]
    const isallowedupdate = Object.keys(req.body).every((k) => allowedkeys.includes(k))
    if(!isallowedupdate)
      {
        throw new Error("Update not allowed")
      }

      if (req.files && req.files.photo && req.files.photo.length > 0) {
        const photoLocalPath = req.files.photo[0].path; // OR cloudinary URL later
  
        const uploadedImg = await uploadOnCloudinary(photoLocalPath)

        if (!uploadedImg) {
          throw new Error("Cloudinary upload failed");
        }

        req.body.photo = uploadedImg.url;
      }

    const {token} = req.cookies;
    if(!token)
      {
        throw new Error("Please Login first");
      }
  
    const decodedmessage = await jwt.verify(token,"coolcool@007");
    const {_id} = decodedmessage
    const data = await User.findByIdAndUpdate(_id,req.body,{runValidators:true,new: true})
    res.send(data)
  }
  catch(err)
  {
    res.status(400).send("UPDATE FAILED:" + err.message);
  }
    })

profileRouter.patch("/profile/changepassword",async (req,res) => 
    {try
    {
    const allowedkeys = ["Password"]
    const isallowedupdate = Object.keys(req.body).every((k) => allowedkeys.includes(k))
    if(!isallowedupdate)
      {
        throw new Error("Update not allowed")
      }
        const {token} = req.cookies;
        if(!token)
        {throw new Error("Login First then come here")}
        else
        {
            const decodedmessage = await jwt.verify(token,"coolcool@007");
            const {_id} = decodedmessage
            const hashedpass = await bcrypt.hash(req.body.Password,10);
            await User.findByIdAndUpdate(_id,{Password:hashedpass},{runValidators:true})
            res.send("Password changed successfully");

        }
    }
    catch(err)
    {
        res.status(400).send("ERROR: "+ err.message);
    }
    })

  module.exports = profileRouter;


