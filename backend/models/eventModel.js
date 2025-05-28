import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ['Meetup', 'Webinar', 'Hackathon', 'Conference', 'Workshop', 'Other'],
      required: [true, 'Please specify the event type']
    },
    startDate: {
      type: Date,
      required: [true, 'Please specify the start date and time']
    },
    endDate: {
      type: Date,
      required: [true, 'Please specify the end date and time']
    },
    location: {
      type: String,
      required: [true, 'Please add a location or specify "Online"']
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    meetingLink: {
      type: String
    },
    coverImage: {
      type: String
    },
    category: {
      type: String,
      enum: [
        'Web Development',
        'Mobile Development',
        'UI/UX Design',
        'Data Science',
        'DevOps',
        'Blockchain',
        'Networking',
        'Career',
        'Other'
      ],
      required: [true, 'Please select a category']
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    capacity: {
      type: Number
    },
    price: {
      type: Number,
      default: 0
    },
    isFree: {
      type: Boolean,
      default: true
    },
    registrations: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        status: {
          type: String,
          enum: ['Registered', 'Attended', 'Cancelled', 'No-show'],
          default: 'Registered'
        },
        registeredAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    tags: [String],
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Cancelled', 'Completed'],
      default: 'Published'
    }
  },
  {
    timestamps: true
  }
);

// Add text index for search functionality
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Event = mongoose.model('Event', eventSchema);

export default Event;