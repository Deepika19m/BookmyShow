const express = require('express');
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const Show = require('../models/Show');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { showId, seatIds, totalAmount, paymentId } = req.body;

    if (!showId || !seatIds || !totalAmount) {
      return res.status(400).json({ message: 'Show ID, seat IDs, and total amount are required' });
    }

    const seats = await Seat.find({
      _id: { $in: seatIds },
      show: showId,
      status: 'available'
    });

    if (seats.length !== seatIds.length) {
      return res.status(400).json({ message: 'Some seats are not available' });
    }

    // Create booking
    const booking = new Booking({
      user: req.user.id,
      show: showId,
      seats: seatIds,
      totalAmount,
      paymentId
    });

    await booking.save();

    // Update seat statuses to booked
    await Seat.updateMany(
      { _id: { $in: seatIds }, show: showId },
      { status: 'booked' }
    );

    res.status(201).json({ message: 'Booking created successfully', bookingId: booking._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's bookings
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: 'show',
        select: 'showTime price',
        populate: {
          path: 'movie',
          select: 'title'
        }
      })
      .populate({
        path: 'show',
        populate: {
          path: 'screen',
          populate: {
            path: 'theater',
            select: 'name'
          }
        }
      })
      .populate('seats', 'row number')
      .sort('-bookingTime');

    const formattedBookings = bookings.map(booking => ({
      id: booking._id,
      movie_title: booking.show.movie.title,
      theater_name: booking.show.screen.theater.name,
      show_time: booking.show.showTime,
      seats: booking.seats.map(seat => `${seat.row}${seat.number}`).join(', '),
      total_amount: booking.totalAmount,
      status: booking.status,
      bookingTime: booking.bookingTime,
      paymentId: booking.paymentId
    }));

    res.json(formattedBookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel a booking
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Booking cannot be cancelled' });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Update seat statuses back to available
    await Seat.updateMany(
      { _id: { $in: booking.seats } },
      { status: 'available' }
    );

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
