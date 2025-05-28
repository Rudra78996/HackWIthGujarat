import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverLetter: {
    type: String,
    required: true
  },
  proposedBudget: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  paymentDetails: {
    paymentId: String,
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'],
      default: 'Pending'
    },
    paymentDate: Date,
    amount: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  }
});

const gigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Web Development',
        'Mobile Development',
        'UI/UX Design',
        'Data Science',
        'DevOps',
        'Blockchain',
        'Other'
      ]
    },
    skills: [{
      type: String,
      required: [true, 'Please add at least one skill']
    }],
    budget: {
      type: Number,
      required: [true, 'Please add a budget']
    },
    duration: {
      type: String,
      required: [true, 'Please specify the project duration']
    },
    deadline: {
      type: Date,
      required: [true, 'Please specify the deadline']
    },
    location: {
      type: String,
      enum: ['Remote', 'Onsite', 'Hybrid'],
      default: 'Remote'
    },
    experience: {
      type: String,
      enum: ['Entry', 'Intermediate', 'Expert'],
      required: [true, 'Please specify the required experience level']
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Open'
    },
    applications: [applicationSchema],
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Add text index for search functionality
gigSchema.index({ title: 'text', description: 'text', skills: 'text' });

const Gig = mongoose.model('Gig', gigSchema);

export default Gig;