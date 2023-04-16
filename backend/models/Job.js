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
    salary: {
      type: Number,
      required: true,
    },
    tags: {
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
          data: Buffer,  // Update the type to Buffer for storing binary data
          contentType: String, // Add a field to store the MIME type 
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