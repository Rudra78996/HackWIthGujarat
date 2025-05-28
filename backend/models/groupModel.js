import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a group name'],
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
        'Career',
        'Open Source',
        'Other'
      ]
    },
    avatar: {
      type: String
    },
    coverImage: {
      type: String
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        role: {
          type: String,
          enum: ['member', 'moderator', 'admin'],
          default: 'member'
        },
        joinedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    tags: [String],
    membershipRequests: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending'
        },
        requestedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Add text index for search functionality
groupSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Group = mongoose.model('Group', groupSchema);

export default Group;