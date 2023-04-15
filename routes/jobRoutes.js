const express = require('express');
const router = express.Router();

const Job = require('../models/Job');
const authenticate = require('../middleware/authenticate');

router.post('/', authenticate(['employer']), async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const job = new Job({
      title,
      description,
      tags,
      employer: req.user.id,
    });
    await job.save();
    res.send(job);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().populate('employer', 'name');
    res.send(jobs);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('employer', 'name');
    res.send(job);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.put('/:id', authenticate(['employer']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) throw new Error('Job not found');
    if (job.employer.toString() !== req.user.id) throw new Error('Unauthorized');
    const { title, description, tags } = req.body;
    job.title = title || job.title;
    job.description = description || job.description;
    job.tags = tags || job.tags;
    await job.save();
    res.send(job);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.delete('/:id', authenticate(['employer']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) throw new Error('Job not found');
    if (job.employer.toString() !== req.user.id) throw new Error('Unauthorized');
    await job.remove();
    res.send({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post('/:id/applications', authenticate(['student']), async (req, res) => {
  try {
    const { resume, message } = req.body;
    const application = new Application({
      job: req.params.id,
      student: req.user.id,
      resume,
      message,
    });
    await application.save();
    res.send(application);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get('/:id/applications', authenticate(['employer']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) throw new Error('Job not found');
    if (job.employer.toString() !== req.user.id) throw new Error('Unauthorized');
    const applications = await Application.find({ job: req.params.id }).populate('student', 'name');
    res.send(applications);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
