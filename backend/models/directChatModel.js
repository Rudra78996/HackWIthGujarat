import mongoose from 'mongoose';

const directChatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Ensure there are exactly 2 participants
directChatSchema.pre('save', function(next) {
  if (this.participants.length !== 2) {
    return next(new Error('Direct chat must have exactly 2 participants'));
  }
  next();
});

const DirectChat = mongoose.model('DirectChat', directChatSchema);

export default DirectChat;