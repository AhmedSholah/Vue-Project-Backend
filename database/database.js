const mongoose = require("mongoose");

async function connectToDB() {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING);
        console.log("Connected To MongoDB");
    } catch (err) {
        console.log(err);
    }
}

module.exports = connectToDB;
