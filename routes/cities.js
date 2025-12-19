const express = require('express');
const City = require('../models/City');

const router = express.Router();

// Get all cities
router.get('/', async (req, res) => {
  try {
    const cities = await City.find().select('id name');
    res.json(cities);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get city by ID
router.get('/:id', async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }
    res.json(city);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
