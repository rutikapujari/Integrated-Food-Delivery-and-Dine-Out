const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("Database connection string is not configured. Add MONGO_URI in backend/.env.");
        }

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
        });

        console.log("Database connected successfully.");
    } catch (error) {
        console.error("Database connection failed.");
        console.error(`Reason: ${error.message}`);

        if (error.name === "MongooseServerSelectionError") {
            console.error(
                "Connection guidance: MongoDB Atlas could not be reached. Please confirm your internet connection, verify the MONGO_URI value, and allow your current IP address in Atlas Network Access before restarting the server."
            );
        }

        process.exit(1);
    }
};

module.exports = connectDB;
