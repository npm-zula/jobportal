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

// STUDENT APPLICATIONS ROUTES

// Set storage engine for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // specify the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // set the filename to be unique
  },
});

// Initialize multer with the storage engine and other options
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') { // specify the allowed file type(s)
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.')); // handle other file types
    }
  },
  limits: { fileSize: 1024 * 1024 * 5 }, // specify the file size limit (in this example, 5 MB)
});

router.post('/:id/apps', authenticate(['student']), upload.single('resume'), async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id });
    if (!job) throw new Error('Job not found');
    
    const { coverMessage } = req.body;

    const applicant = {
      student: req.user.id,
      resume: req.file.path, // save the file path in the database
      coverMessage: coverMessage,
      status: 'applied',
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
        status: applicant.status,
        id : applicant._id
      };
    });    res.send(applications);
  } catch (error) {
    res.status(400).send(error.message);
  }
});


// CHANGE APPLICANT STATUS

router.put('/:jobId/apps/:appId/status', authenticate(['employer']), async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const appId = req.params.appId;
    const newStatus = req.body.status;

    // Find the job by ID and validate the employer's ownership
    const job = await Job.findById(jobId);
    // console.log(job);
    if (!job) throw new Error('Job not found');
    if (job.employer.toString() !== req.user.id) throw new Error('Unauthorized');


    // console.log(job.applicants[1].id);
    // Find the index of the applicant in the applicants array
    const applicantIndex = job.applicants.findIndex(applicant => applicant.id === appId);


    if (applicantIndex === -1) throw new Error('Application not found');

    // Update the status of the applicant and save the job
    job.applicants[applicantIndex].status = newStatus;
    await job.save();

    res.send('Application status updated successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
