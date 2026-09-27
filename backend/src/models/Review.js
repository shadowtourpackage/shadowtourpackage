import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['text', 'video'],
      default: 'text',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
      maxlength: [100, 'Destination cannot exceed 100 characters'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: 5,
    },
    review: {
      type: String,
      trim: true,
      maxlength: [500, 'Review cannot exceed 500 characters'],
      default: '',
    },
    videoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    approved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Review = mongoose.model('Review', reviewSchema);