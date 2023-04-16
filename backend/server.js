const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
let cors = require("cors");
require('dotenv').config()

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const searchRoutes = require('./routes/searchRoutes');

mongoose.connect('mongodb://127.0.0.1:27017/job-portaldb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const corsOptions = {
  origin: 'http://127.0.0.1:5500', // Replace with your frontend domain
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/search', searchRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Hello World!')
  })



module.exports = app;
