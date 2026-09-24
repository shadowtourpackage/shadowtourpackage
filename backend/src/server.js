import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { verifyMailer, sendBookingNotification } from './config/mailer.js';
import { Booking } from './models/Booking.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Test SMTP connection
verifyMailer();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  })
);
app.use(express.json());

// Server health check
app.get('/api/health', (_, res) => {
  res.json({
    ok: true,
    service: 'Shadow Tours Enquiry Service',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

// Fetch all enquiries (Internal/Admin)
app.get('/api/bookings', async (_, res, next) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).lean();
    res.json({ ok: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
});

// Create new enquiry endpoint
app.post('/api/bookings', async (req, res, next) => {
  try {
    const { name, email, phone, destination, category, travellers, travelDate } = req.body || {};
    const errors = {};

    // 1. Server-side Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.name = 'Please enter your full name.';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long.';
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const trimmedEmail = email && typeof email === 'string' ? email.trim() : null;

    if (trimmedEmail && !emailRegex.test(trimmedEmail)) {
      errors.email = 'Please provide a valid email address or leave it blank.';
    }

    const phoneRegex = /^[+\d][\d\s-]{7,15}$/;
    if (!phone || typeof phone !== 'string' || !phoneRegex.test(phone.trim())) {
      errors.phone = 'Please provide a valid phone number (8-15 digits).';
    }

    if (!destination || typeof destination !== 'string' || !destination.trim()) {
      errors.destination = 'Please choose or enter a destination.';
    }

    if (!category || typeof category !== 'string' || !category.trim()) {
      errors.category = 'Please choose a package category.';
    }

    const parsedTravellers = parseInt(travellers, 10);
    if (isNaN(parsedTravellers) || parsedTravellers < 1 || parsedTravellers > 50) {
      errors.travellers = 'Travellers must be a valid number between 1 and 50.';
    }

    let parsedDate = null;
    if (travelDate) {
      parsedDate = new Date(travelDate);
      if (isNaN(parsedDate.getTime())) {
        errors.travelDate = 'Invalid travel date provided.';
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        ok: false,
        message: 'Validation failed. Please review the errors.',
        errors
      });
    }

    // 2. Persist to MongoDB
    const newBooking = new Booking({
      name: name.trim(),
      email: trimmedEmail ? trimmedEmail.toLowerCase() : null,
      phone: phone.trim(),
      destination: destination.trim(),
      category: category.trim(),
      travellers: parsedTravellers,
      travelDate: parsedDate
    });

    const savedBooking = await newBooking.save();

    // 3. Dispatch Email Notification (Non-blocking DB integrity)
    let emailSent = false;
    try {
      await sendBookingNotification(savedBooking);
      savedBooking.emailNotificationStatus = 'sent';
      await savedBooking.save();
      emailSent = true;
    } catch (mailError) {
      console.error(`[Mailer Error] Failed to dispatch email for booking ${savedBooking.bookingReference}:`, mailError.message);
      savedBooking.emailNotificationStatus = 'failed';
      await savedBooking.save();
    }

    // 4. Return success response
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
        emailNotificationDispatched: emailSent
      }
    });
  } catch (error) {
    next(error);
  }
});

// Centralized Error Handling Middleware
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
      errors: formattedErrors
    });
  }

  return res.status(500).json({
    ok: false,
    message: 'An internal server error occurred while processing your request.'
  });
});

app.listen(PORT, () => console.log(`[Server] Shadow Tours API running on http://localhost:${PORT}`));