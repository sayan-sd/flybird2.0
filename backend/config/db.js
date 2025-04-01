const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
exports.connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
    } catch (error) {
        console.error("Error in connecting MongoDB", error.message);
        process.exit(1);
    }
};