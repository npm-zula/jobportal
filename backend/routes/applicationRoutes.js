const express = require('express');
const router = express.Router();

const Job = require('../models/Job');
const authenticate = require('../middleware/authenticate');

router.get('/', authenticate(['placement_officer']), async (req, res) => {
  try {
    const applications = await Application.find().populate('job', 'title employer');
    console.log("asdasd")

    res.send(applications);
  } catch (error) {
    res.status(400).send(error.message);
  }
});


// CHANGE APPLLICATION STATUS
router.put('/:id', authenticate(['placement_officer']), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) throw new Error('Application not found');
    const { status } = req.body;
    application.status = status || application.status;
    await application.save();
    res.send(application);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
