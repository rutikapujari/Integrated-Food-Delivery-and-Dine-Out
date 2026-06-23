const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());



app.get('/', (req, res) => res.send('API running'));

app.listen(5000, () => console.log('Server on port 5000'));