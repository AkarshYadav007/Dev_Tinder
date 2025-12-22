const mongoose = require("mongoose");

const connection = async() => {
    await mongoose.connect(process.env.DB_CONNECTION_SECRET)
}

module.exports = connection;



 
