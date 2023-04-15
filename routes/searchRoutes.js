const express = require('express');
const router = express.Router();

const Job  = require('../models/Job');
const authenticate = require('../middleware/authenticate');

router.get('/', async (req, res) => {
  try {
    const searchTags = req.query.tags;
  
    const jobs = await Job.find({ tags: { $in: searchTags } }).populate('employer', 'name email');

    res.send(jobs);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
