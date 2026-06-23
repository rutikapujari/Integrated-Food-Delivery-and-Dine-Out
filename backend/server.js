require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.listen(5000, () => {
    console.log("Server started on port 5000");
});