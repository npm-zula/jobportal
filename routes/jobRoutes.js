const express = require('express');
const router = express.Router();
const multer = require('multer'); // Require multer for handling file uploads
// const upload = multer() // Create a multer instance
const path = require('path');


const Job = require('../models/Job');
const authenticate = require('../middleware/authenticate');

router.post('/', authenticate(['employer']), async (req, res) => {
  try {
    console.log("hi")
    const { title, description, salary, tags } = req.body;
    const job = new Job({
      title,
      description,
      tags,
      salary,
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

// configure multer to store uploaded files in local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // specify the directory where files will be stored
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // specify the file name
  },
});
const upload = multer({ storage: storage });

router.post('/:id/apps', authenticate(['student']), upload.single('resume'), async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id });
    if (!job) throw new Error('Job not found');
    
    const { coverMessage } = req.body;

    // const { coverMessage } = req.body;

    const applicant = {
      student: req.user.id,
      resume: {
        data: fs.readFileSync(req.file.path),
        contentType: req.file.mimetype,
      },
      coverMessage: coverMessage,
    };
    job.applicants.push(applicant);
    await job.save();
    res.send({ message: 'Application submitted successfully' });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get('/:id/apps', authenticate(['employer']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) throw new Error('Job not found');
    if (job.employer.toString() !== req.user.id) throw new Error('Unauthorized');
    const applications = job.applicants.map(applicant => {
      return {
        student: applicant.student,
        resume: applicant.resume,
        coverMessage: applicant.coverMessage,
        status: applicant.status
      };
    });    res.send(applications);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
