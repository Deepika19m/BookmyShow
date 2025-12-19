const express = require('express');
const Seat = require('../models/Seat');
const Show = require('../models/Show');
const auth = require('../middleware/auth');

const router = express.Router();

// Get seats for a show
router.get('/:showId', auth, async (req, res) => {
  try {
    const show = await Show.findById(req.params.showId);
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    const seats = await Seat.find({ show: req.params.showId })
      .sort('row number');

    const formattedSeats = seats.map(seat => ({
      id: seat._id,
      row: seat.row,
      number: seat.number,
      status: seat.status
    }));

    res.json(formattedSeats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Lock seats temporarily
router.post('/:showId/lock', auth, async (req, res) => {
  try {
    const { seatIds } = req.body;
    const showId = req.params.showId;

    // Check if seats are available
    const seats = await Seat.find({
      _id: { $in: seatIds },
      show: showId,
      status: 'available'
    });

    if (seats.length !== seatIds.length) {
      return res.status(400).json({ message: 'Some seats are not available' });
    }

    // Lock seats for 5 minutes
    await Seat.updateMany(
      { _id: { $in: seatIds }, show: showId },
      { status: 'locked', lockedBy: req.user.id, lockedUntil: new Date(Date.now() + 5 * 60 * 1000) }
    );

    res.json({ message: 'Seats locked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Unlock seats
router.post('/:showId/unlock', auth, async (req, res) => {
  try {
    const { seatIds } = req.body;
    const showId = req.params.showId;

    await Seat.updateMany(
      { _id: { $in: seatIds }, show: showId, lockedBy: req.user.id },
      { status: 'available', lockedBy: null, lockedUntil: null }
    );

    res.json({ message: 'Seats unlocked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
