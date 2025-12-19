const express = require("express");
const userRouter = express.Router();
const userAuth = require("../middlewares/auth")
const ConnectionRequest = require("../models/ConnectionRequest");
const User = require("../models/user")


userRouter.get("/user/requests/received",userAuth,async(req,res) => 
    {
        loggedInUser = req.userdata

        const datu = await ConnectionRequest.find({
            toUserid:loggedInUser._id,
            status:"interested"
        }).populate("fromUserid","FirstName LastName Age Gender photo")

        const datavalue = datu
  .filter(row => row.fromUserid !== null)
  .map(row => row.fromUserid);


        if (datavalue.length === 0) {
    return res.json({ data: [] });
}
        else
            {
                res.json({data:datavalue})
            }

        
    })

userRouter.get("/user/connections",userAuth,async(req,res) => 
    {
        loggedInUser = req.userdata

        const datu = await ConnectionRequest.find({
            $or:[
                {fromUserid:loggedInUser._id,status:"accepted"},
                {toUserid:loggedInUser._id,status:"accepted"}]
        }).populate("toUserid","FirstName LastName Age Gender photo").populate("fromUserid", "FirstName LastName Age Gender photo")

        const datavalue = datu
  .filter(row => row.fromUserid && row.toUserid) // 🔐 IMPORTANT
  .map(row => {
    if (row.fromUserid._id.toString() === loggedInUser._id.toString()) {
      return row.toUserid;
    }
    return row.fromUserid;
  });

        if (datavalue.length === 0) {
    return res.json({ data: [] });
}

        else
            {
                res.json({data:datavalue})
            }
})

userRouter.get("/user/feed",userAuth,async (req,res) => {

    const page = parseInt(req.query.page) || 1
    let limit = parseInt(req.query.limit) || 10
    limit = limit > 50 ? 50 :limit;
    const skip = (page-1)*limit

    const loggedInUser = req.userdata;
    const datu = await ConnectionRequest.find({
        $or:[{fromUserid:loggedInUser._id},{toUserid:loggedInUser._id}]
    }).select("fromUserid toUserid")

    const uniquedata = new Set() 
    datu.forEach((req) => {
        uniquedata.add(req.fromUserid.toString())
        uniquedata.add(req.toUserid.toString())
    })

    const finaldata = await User.find({
        $and:
        [
            {_id:{$nin: Array.from(uniquedata)}},
            {_id:{$ne: loggedInUser._id}} 
        ]}).select("FirstName LastName Age Gender photo about").skip(skip).limit(limit)
        res.send(finaldata)
})



    module.exports = userRouter;


