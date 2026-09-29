import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import { connectDB } from './src/config/db.js';
import {
  verifyMailer,
  sendBookingNotification,
} from './src/config/mailer.js';

import { Booking } from './src/models/Booking.js';
import { Review } from './src/models/Review.js';
const PORT = process.env.PORT || 10000;
const app = express();

/* =====================================================
   DATABASE & MAILER
===================================================== */

connectDB();
verifyMailer();

/* =====================================================
   MIDDLEWARE
===================================================== */

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

/* =====================================================
   ADMIN SCHEMA & MODEL
===================================================== */

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'admins',
  }
);

const Admin =
  mongoose.models.Admin ||
  mongoose.model('Admin', adminSchema);

/* =====================================================
   ADMIN LOGIN ENDPOINT
===================================================== */

app.post('/api/admin/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        ok: false,
        message: 'Username and password are required.',
      });
    }

    const normalizedUsername = username.toLowerCase().trim();

    const admin = await Admin.findOne({
      username: normalizedUsername,
    }).lean();

    if (!admin) {
      return res.status(401).json({
        ok: false,
        message: 'Invalid username or password.',
      });
    }

    const isValid = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isValid) {
      return res.status(401).json({
        ok: false,
        message: 'Invalid username or password.',
      });
    }

    return res.json({
      ok: true,
      message: 'Authentication successful.',
      user: {
        id: admin._id,
        username: admin.username,
      },
    });
  } catch (error) {
    next(error);
  }
});

/* =====================================================
   HEALTH CHECK
===================================================== */

app.get('/api/health', (_, res) => {
  res.json({
    ok: true,
    service: 'Shadow Tours API',
    status: 'operational',
    timestamp: new Date().toISOString(),
  });
});

/* =====================================================
   BOOKINGS / ENQUIRIES ENDPOINTS
===================================================== */

app.get('/api/bookings', async (_, res, next) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      ok: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/bookings', async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      destination,
      category,
      travellers,
      travelDate,
    } = req.body || {};

    const errors = {};

    if (
      !name ||
      typeof name !== 'string' ||
      !name.trim()
    ) {
      errors.name = 'Please enter your full name.';
    }

    const phoneRegex = /^[+\d][\d\s-]{7,15}$/;

    if (
      !phone ||
      typeof phone !== 'string' ||
      !phoneRegex.test(phone.trim())
    ) {
      errors.phone = 'Please provide a valid phone number.';
    }

    if (
      !destination ||
      typeof destination !== 'string' ||
      !destination.trim()
    ) {
      errors.destination =
        'Please choose or enter a destination.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        ok: false,
        message: 'Validation failed.',
        errors,
      });
    }

    const newBooking = new Booking({
      bookingReference: `ST-${Date.now()
        .toString()
        .slice(-6)}`,

      name: name.trim(),

      email: email
        ? email.trim().toLowerCase()
        : null,

      phone: phone.trim(),

      destination: destination.trim(),

      category: category
        ? category.trim()
        : 'Custom',

      travellers:
        parseInt(travellers, 10) || 1,

      travelDate: travelDate
        ? new Date(travelDate)
        : null,
    });

    const savedBooking = await newBooking.save();

    /* =================================================
       SEND BOOKING EMAIL
    ================================================= */

    try {
      await sendBookingNotification(savedBooking);

      savedBooking.emailNotificationStatus =
        'sent';

      await savedBooking.save();
    } catch (mailError) {
      console.error(
        '[Mailer Error]:',
        mailError.message
      );

      savedBooking.emailNotificationStatus =
        'failed';

      await savedBooking.save();
    }

    return res.status(201).json({
      ok: true,
      message:
        'Booking enquiry registered successfully.',
      data: savedBooking,
    });
  } catch (error) {
    next(error);
  }
});

/* =====================================================
   REVIEWS ENDPOINTS
===================================================== */

app.get('/api/reviews', async (_, res, next) => {
  try {
    const reviews = await Review.find({
      approved: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      ok: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/reviews', async (req, res, next) => {
  try {
    const {
      name,
      destination,
      rating,
      review,
      type,
      videoUrl,
    } = req.body || {};

    const newReview = new Review({
      type:
        type === 'video'
          ? 'video'
          : 'text',

      name: name
        ? name.trim()
        : 'Guest',

      destination: destination
        ? destination.trim()
        : 'Tour',

      rating:
        Number(rating) || 5,

      review: review
        ? review.trim()
        : '',

      videoUrl: videoUrl
        ? videoUrl.trim()
        : '',

      approved: false,
    });

    const savedReview =
      await newReview.save();

    return res.status(201).json({
      ok: true,
      data: savedReview,
    });
  } catch (error) {
    next(error);
  }
});

/* =====================================================
   GLOBAL ERROR HANDLER
===================================================== */

app.use((err, req, res, _next) => {
  console.error(
    '[Server Error]:',
    err.message
  );

  res.status(500).json({
    ok: false,
    message:
      err.message ||
      'Internal Server Error',
  });
});

/* =====================================================
   VERCEL EXPORT
===================================================== */

app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
});
export default app;