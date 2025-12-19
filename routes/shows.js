const express = require('express');
const Show = require('../models/Show');
const Theater = require('../models/Theater');
const auth = require('../middleware/auth');

const router = express.Router();

// Get shows for a movie in a city
router.get('/', auth, async (req, res) => {
  try {
    const { movie_id, city_id } = req.query;
    if (!movie_id || !city_id) {
      return res.status(400).json({ message: 'Movie ID and City ID are required' });
    }

    // Find theaters in the city
    const theaters = await Theater.find({ city: city_id }).select('_id name');
    const theaterIds = theaters.map(t => t._id);

    // Find shows for the movie in those theaters
    const shows = await Show.find({
      movie: movie_id,
      screen: { $in: await getScreensFromTheaters(theaterIds) }
    })
    .populate('screen', 'name theater')
    .populate({
      path: 'screen',
      populate: {
        path: 'theater',
        select: 'name'
      }
    })
    .sort('showTime');

    const formattedShows = shows.map(show => ({
      id: show._id,
      theater_name: show.screen.theater.name,
      screen_name: show.screen.name,
      show_time: show.showTime,
      price: show.price,
      available_seats: show.availableSeats
    }));

    res.json(formattedShows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to get screens from theaters
async function getScreensFromTheaters(theaterIds) {
  const Screen = require('../models/Screen');
  const screens = await Screen.find({ theater: { $in: theaterIds } });
  return screens.map(s => s._id);
}

module.exports = router;
