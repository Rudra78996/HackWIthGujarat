import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: [true, 'Message content is required']
    },
    // Can be either a group chat or a direct message
    chatType: {
      type: String,
      enum: ['group', 'direct'],
      required: true
    },
    // Reference depends on chatType
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // Reference is dynamically determined based on chatType
      refPath: 'chatModel'
    },
    chatModel: {
      type: String,
      required: true,
      enum: ['Group', 'DirectChat']
    },
    attachments: [
      {
        type: {
          type: String,
          enum: ['image', 'file', 'link']
        },
        url: String,
        name: String,
        size: Number
      }
    ],
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        readAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;