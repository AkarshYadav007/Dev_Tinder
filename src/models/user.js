const mongoose = require('mongoose')
const validator = require("validator")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");

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
    Password: {
    type: String,
    required: true,
    validate(value) {
        if (!validator.isStrongPassword(value, {
            minLength: 8,
            minLowercase: 1,
            minUppercase:0,
            minNumbers: 1,
            minSymbols: 1
        })) {
            throw new Error("Password is not strong enough");
        }
    },
    select: false
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
    },

    photo: {
        type: String,
        default: "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"
    },
    photoPublicId: {
    type: String,
    default: null
  },

    about: {
        type: String,
        maxLength: 500,
        default: ""
    }
},
{timestamps:true})

// Hash password AFTER validation, BEFORE saving
userschema.pre("save", async function(next) {
    const user = this;

    // Hash only if password is new or modified
    if (user.isModified("Password")) {
        user.Password = await bcrypt.hash(user.Password, 10);
    }

    next();
});

userschema.methods.getJWT = function() {
  return jwt.sign(
    { _id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const User = mongoose.model("user",userschema);

module.exports = User;

