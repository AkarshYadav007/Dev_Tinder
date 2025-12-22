const express = require("express");
const mongoose = require("mongoose");
const requestRouter = express.Router();

const userAuth = require("../middlewares/auth");
const ConnectionRequest = require("../models/ConnectionRequest");
const User = require("../models/user");

const sendEmail = require("../utils/sendEmail")

requestRouter.post("/request/send/:status/:toUserid", userAuth, async (req, res) => {
    try {
        const Touserid = new mongoose.Types.ObjectId(req.params.toUserid);
        const Fromuserid = new mongoose.Types.ObjectId(req.userdata._id);
        const status = req.params.status;

        const allowedstatus = ["ignored", "interested"];
        if (!allowedstatus.includes(status)) {
            throw new Error("Invalid status");
        }

        const receiver = await User.findById(Touserid);
        if (!receiver) throw new Error("User not found");

        if (Touserid.equals(Fromuserid)) {
            throw new Error("Cannot send request to yourself");
        }

        const connectionalreadyexists = await ConnectionRequest.findOne({
            $or: [
                { fromUserid: Fromuserid, toUserid: Touserid },
                { fromUserid: Touserid, toUserid: Fromuserid }
            ]
        });

        if (connectionalreadyexists) {
            throw new Error("Connection already exists");
        }

        const connectionrequest = new ConnectionRequest({
            fromUserid: Fromuserid,
            toUserid: Touserid,
            status
        });

        await connectionrequest.save();

   // try {
 // await sendEmail.run({
   // subject: "Someone sent you a friend request",
   // body: `You've got a friend request from ${req.userdata.FirstName}`
 // });
// } catch (err) {
 // console.error("Email failed:", err.message);
// }

return res.send("Request Sent Successfully");

    } catch (err) {
        return res.status(400).send("ERROR: " + err.message);
    }
});


requestRouter.post("/request/review/:status/:requestId",userAuth,async (req,res) => 
    {
        try
        {
            const loggedUser = req.userdata._id

            const {status,requestId} = req.params;
            
            const allowed = ["accepted","rejected"]
            if(!allowed.includes(status))
            {
                throw new Error("status not allowed")
            }
            const userinfo = await ConnectionRequest.findOne({
                fromUserid: requestId,
                toUserid: loggedUser,
                status:"interested"
            })
            if(!userinfo)
            {
               throw new Error("nothing matches in the database")
            }
            else
            {
                userinfo.status = status
                await userinfo.save();
                res.send("request has been saved")
            }
        }
        catch(err)
        {
            res.status(400).send("ERROR: " + err.message);
        }
    })

  module.exports = requestRouter;

