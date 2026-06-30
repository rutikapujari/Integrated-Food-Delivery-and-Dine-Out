const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing from backend/.env");
        }

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
        });

        console.log(`MongoDB connected successfully: ${mongoose.connection.name}`);
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
        if (error.name === "MongooseServerSelectionError") {
            console.error(
                "Atlas rejected or could not reach this connection. Add your current public IP in MongoDB Atlas > Network Access > Add IP Address, then restart nodemon."
            );
        }
        process.exit(1);
    }
};

module.exports = connectDB;
