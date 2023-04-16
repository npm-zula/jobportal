const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config()

const authRoutes = require('../routes/authRoutess');
const jobRoutes = require('../routes/jobRoutess');
const searchRoutes = require('../routes/searchRoutess');

mongoose.connect('mongodb://127.0.0.1:27017/job-portaldb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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
