import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import { connectDB } from './config/db.js';
import { verifyMailer, sendBookingNotification } from './config/mailer.js';

import { Booking } from './models/Booking.js';
import { Review } from './models/Review.js';

const app = express();
const PORT = process.env.PORT || 5000;

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
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  })
);

app.use(express.json());

/* =====================================================
   HEALTH CHECK
===================================================== */
app.get('/api/health', (_, res) => {
  res.json({
    ok: true,
    service: 'Shadow Tours Enquiry & Review Service',
    status: 'operational',
    timestamp: new Date().toISOString(),
  });
});

/* =====================================================
   BOOKINGS
===================================================== */

/* GET ALL BOOKINGS */
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

/* CREATE BOOKING */
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

    /* NAME */
    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.name = 'Please enter your full name.';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long.';
    }

    /* EMAIL */
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const trimmedEmail =
      email && typeof email === 'string' ? email.trim() : null;

    if (trimmedEmail && !emailRegex.test(trimmedEmail)) {
      errors.email = 'Please provide a valid email address or leave it blank.';
    }

    /* PHONE */
    const phoneRegex = /^[+\d][\d\s-]{7,15}$/;
    if (!phone || typeof phone !== 'string' || !phoneRegex.test(phone.trim())) {
      errors.phone = 'Please provide a valid phone number (8-15 digits).';
    }

    /* DESTINATION */
    if (!destination || typeof destination !== 'string' || !destination.trim()) {
      errors.destination = 'Please choose or enter a destination.';
    }

    /* CATEGORY */
    if (!category || typeof category !== 'string' || !category.trim()) {
      errors.category = 'Please choose a package category.';
    }

    /* TRAVELLERS */
    const parsedTravellers = parseInt(travellers, 10);
    if (
      isNaN(parsedTravellers) ||
      parsedTravellers < 1 ||
      parsedTravellers > 50
    ) {
      errors.travellers = 'Travellers must be a valid number between 1 and 50.';
    }

    /* DATE */
    let parsedDate = null;
    if (travelDate) {
      parsedDate = new Date(travelDate);
      if (isNaN(parsedDate.getTime())) {
        errors.travelDate = 'Invalid travel date provided.';
      }
    }

    /* VALIDATION */
    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        ok: false,
        message: 'Validation failed. Please review the errors.',
        errors,
      });
    }

    /* SAVE BOOKING */
    const newBooking = new Booking({
      name: name.trim(),
      email: trimmedEmail ? trimmedEmail.toLowerCase() : null,
      phone: phone.trim(),
      destination: destination.trim(),
      category: category.trim(),
      travellers: parsedTravellers,
      travelDate: parsedDate,
    });

    const savedBooking = await newBooking.save();

    /* EMAIL NOTIFICATION */
    let emailSent = false;
    try {
      await sendBookingNotification(savedBooking);
      savedBooking.emailNotificationStatus = 'sent';
      await savedBooking.save();
      emailSent = true;
    } catch (mailError) {
      console.error('[Mailer Error]', mailError.message);
      savedBooking.emailNotificationStatus = 'failed';
      await savedBooking.save();
    }

    return res.status(201).json({
      ok: true,
      message: 'Your tour enquiry has been successfully registered.',
      data: {
        bookingReference: savedBooking.bookingReference,
        name: savedBooking.name,
        email: savedBooking.email,
        destination: savedBooking.destination,
        category: savedBooking.category,
        travellers: savedBooking.travellers,
        travelDate: savedBooking.travelDate,
        emailNotificationDispatched: emailSent,
      },
    });
  } catch (error) {
    next(error);
  }
});

/* =====================================================
   REVIEWS (PUBLIC)
===================================================== */

/* GET APPROVED REVIEWS (For Front-end Carousel) */
app.get('/api/reviews', async (_, res, next) => {
  try {
    const reviews = await Review.find({ approved: true })
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

/* SUBMIT REVIEW (Defaults approved to false) */
app.post('/api/reviews', async (req, res, next) => {
  try {
    const { name, destination, rating, review, type, videoUrl } =
      req.body || {};

    const errors = {};

    /* NAME */
    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.name = 'Please enter your name.';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    } else if (name.trim().length > 50) {
      errors.name = 'Name cannot exceed 50 characters.';
    }

    /* DESTINATION */
    if (!destination || typeof destination !== 'string' || !destination.trim()) {
      errors.destination = 'Please provide the destination you visited.';
    }

    /* RATING */
    const parsedRating = Number(rating);
    if (
      !Number.isInteger(parsedRating) ||
      parsedRating < 1 ||
      parsedRating > 5
    ) {
      errors.rating = 'Please select a rating between 1 and 5 stars.';
    }

    const reviewType = type === 'video' ? 'video' : 'text';

    /* REVIEW BODY */
    if (reviewType === 'text') {
      if (!review || typeof review !== 'string' || !review.trim()) {
        errors.review = 'Please write your review.';
      } else if (review.trim().length < 10) {
        errors.review = 'Review must be at least 10 characters.';
      } else if (review.trim().length > 500) {
        errors.review = 'Review cannot exceed 500 characters.';
      }
    }

    /* VIDEO URL */
    if (reviewType === 'video' && (!videoUrl || !videoUrl.trim())) {
      errors.videoUrl = 'Please provide a valid video link.';
    }

    /* VALIDATION RESULT */
    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        ok: false,
        message: 'Please correct the highlighted fields.',
        errors,
      });
    }

    /* CREATE REVIEW */
    const newReview = new Review({
      type: reviewType,
      name: name.trim(),
      destination: destination.trim(),
      rating: parsedRating,
      review: reviewType === 'text' ? review.trim() : '',
      videoUrl: reviewType === 'video' ? videoUrl.trim() : '',
      approved: true, // Must be approved by admin before appearing on frontend
    });

    const savedReview = await newReview.save();

    return res.status(201).json({
      ok: true,
      message:
        'Thank you for your feedback! Your review has been submitted for approval.',
      data: savedReview,
    });
  } catch (error) {
    next(error);
  }
});

/* =====================================================
   REVIEWS (ADMIN)
===================================================== */

/* GET ALL REVIEWS (Pending + Approved) */
app.get('/api/reviews/all', async (_, res, next) => {
  try {
    const reviews = await Review.find()
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

/* APPROVE REVIEW */
app.patch('/api/reviews/:id/approve', async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        ok: false,
        message: 'Review not found.',
      });
    }

    res.json({
      ok: true,
      message: 'Review approved successfully.',
      data: review,
    });
  } catch (error) {
    next(error);
  }
});

/* DELETE REVIEW */
app.delete('/api/reviews/:id', async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        ok: false,
        message: 'Review not found.',
      });
    }

    res.json({
      ok: true,
      message: 'Review deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
});

/* =====================================================
   ERROR HANDLER
===================================================== */
app.use((err, req, res, _next) => {
  console.error('[Unhandled Exception]:', err);

  if (err.name === 'ValidationError') {
    const formattedErrors = {};
    for (const field of Object.keys(err.errors)) {
      formattedErrors[field] = err.errors[field].message;
    }
    return res.status(422).json({
      ok: false,
      message: 'Validation failed.',
      errors: formattedErrors,
    });
  }

  return res.status(500).json({
    ok: false,
    message: 'An internal server error occurred while processing your request.',
  });
});

/* =====================================================
   START SERVER
===================================================== */
app.listen(PORT, () => {
  console.log(`[Server] Shadow Tours API running on port ${PORT}`);
});