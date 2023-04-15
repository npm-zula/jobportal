const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    experience: {
      type: Number,
      required: true,
    },
    keywords: {
      type: [String],
      required: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicants: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        resume: {
          type: String,
          required: true,
        },
        coverMessage: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: ['applied', 'shortlisted', 'rejected'],
          default: 'applied',
        },
      },
    ],
  },
  { timestamps: true }
);

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;