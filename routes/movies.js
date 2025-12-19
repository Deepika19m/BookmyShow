const express = require('express');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');

const router = express.Router();

// Get movies by city
router.get('/', async (req, res) => {
  try {
    const { city_id } = req.query;
    if (!city_id) {
      return res.status(400).json({ message: 'City ID is required' });
    }

    // Find theaters in the city and get their shows' movies
    const theaters = await Theater.find({ city: city_id }).select('_id');
    const theaterIds = theaters.map(t => t._id);

    // This is a simplified version - in reality, you'd join with shows
    // For now, return all movies (you'd filter by city in a real implementation)
    const movies = await Movie.find().select('id title genre duration rating posterUrl');

    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get movie by ID
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
