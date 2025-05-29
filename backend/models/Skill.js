import mongoose from 'mongoose';

const skillSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a skill name'],
      unique: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner',
    },
    category: {
      type: String,
      required: [true, 'Please add a skill category'],
      enum: [
        'programming',
        'design',
        'marketing',
        'business',
        'writing',
        'other',
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Check if model exists before creating a new one
const Skill = mongoose.models.Skill || mongoose.model('Skill', skillSchema);

export default Skill; 