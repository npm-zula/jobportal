const express = require('express');
const router = express.Router();

const Job  = require('../models/Job');
const authenticate = require('../middleware/authenticate');

router.get('/', async (req, res) => {
  try {
    const { title, location, salary, experience, keywords } = req.query;
    const query = {};

    if (title) query.title = new RegExp(title, 'i');
    if (location) query.location = new RegExp(location, 'i');
    if (salary) query.salary = { $gte: salary };
    if (experience) query.experience = { $gte: experience };
    if (keywords) {
      const keywordsArr = keywords.split(',').map((kw) => new RegExp(kw.trim(), 'i'));
      query.keywords = { $in: keywordsArr };
    }

    const jobs = await Job.find(query).populate('employer', 'name email');
    res.send(jobs);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
