const mongoose = require('mongoose')
const validator = require("validator")
const jwt = require("jsonwebtoken")

const userschema = mongoose.Schema({
    FirstName:{
        type:String,
        required:true,
        minLength:3
    },
    LastName:{
        type:String,
        required:true,
        minLength:3
    },
    Email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        validate(value)
        {
            if(!validator.isEmail(value))
                {
                    throw new Error("the email is not valid")
                }
        }
    },
    Password:{
        type:String,
        required:true,
    },
    Age:{
        type:Number,
        min:18
    },
    Gender:{
        type:String,
        validate(value)
        {
            if (!["male","female","others"].includes(value)) 
            {
            throw new Error("Gender entered is incorrect");
            }
        }
    }
},
{timestamps:true})

userschema.methods.getJWT = async function () 
{
    const user = this

    const token = await jwt.sign({_id:user._id},"coolcool@007",{expiresIn: "1h"})

    return token;
}

const User = mongoose.model("user",userschema);

module.exports = User;