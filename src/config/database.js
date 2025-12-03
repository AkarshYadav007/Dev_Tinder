const mongoose = require("mongoose");

const connection = async() => {
    await mongoose.connect("mongodb+srv://akarshyadav845_db_user:xUgpC6ZRoBcWB2HW@namastenodejs.rzgyryg.mongodb.net/DevTinder")
}

module.exports = connection;



 
