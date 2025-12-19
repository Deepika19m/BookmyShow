const mongoose = require('mongoose');
const City = require('./models/City');
const Theater = require('./models/Theater');
const Screen = require('./models/Screen');
const Movie = require('./models/Movie');
const Show = require('./models/Show');
const Seat = require('./models/Seat');

require('dotenv').config();

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookmyshow');

    // Clear existing data
    await City.deleteMany({});
    await Theater.deleteMany({});
    await Screen.deleteMany({});
    await Movie.deleteMany({});
    await Show.deleteMany({});
    await Seat.deleteMany({});

    // Create cities
    const cities = await City.insertMany([
      { name: 'New York' },
      { name: 'Los Angeles' },
      { name: 'Chicago' }
    ]);

    // Create theaters
    const theaters = [];
    for (const city of cities) {
      const cityTheaters = await Theater.insertMany([
        { name: `${city.name} Cinema 1`, city: city._id, address: `123 Main St, ${city.name}` },
        { name: `${city.name} Cinema 2`, city: city._id, address: `456 Oak Ave, ${city.name}` }
      ]);
      theaters.push(...cityTheaters);
    }

    // Create screens for each theater
    const screens = [];
    for (const theater of theaters) {
      const theaterScreens = await Screen.insertMany([
        { name: 'Screen 1', theater: theater._id, totalSeats: 100 },
        { name: 'Screen 2', theater: theater._id, totalSeats: 80 }
      ]);
      screens.push(...theaterScreens);
      theater.screens = theaterScreens.map(s => s._id);
      await theater.save();
    }

    // Create movies
    const movies = await Movie.insertMany([
      {
        title: 'The Avengers',
        genre: 'Action',
        duration: 143,
        rating: 'PG-13',
        releaseDate: new Date('2012-05-04'),
        description: 'Earth\'s mightiest heroes must come together to stop Loki and his alien army.'
      },
      {
        title: 'Inception',
        genre: 'Sci-Fi',
        duration: 148,
        rating: 'PG-13',
        releaseDate: new Date('2010-07-16'),
        description: 'A thief who steals corporate secrets through dream-sharing technology.'
      },
      {
        title: 'The Dark Knight',
        genre: 'Action',
        duration: 152,
        rating: 'PG-13',
        releaseDate: new Date('2008-07-18'),
        description: 'Batman faces his greatest challenge yet.'
      }
    ]);

    // Create shows
    const shows = [];
    for (const screen of screens) {
      for (const movie of movies) {
        const showTimes = [
          new Date(Date.now() + 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // Tomorrow 10 AM
          new Date(Date.now() + 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // Tomorrow 2 PM
          new Date(Date.now() + 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000)  // Tomorrow 6 PM
        ];

        for (const showTime of showTimes) {
          const show = await Show.create({
            movie: movie._id,
            screen: screen._id,
            showTime,
            price: Math.floor(Math.random() * 10) + 10, // Random price between 10-20
            availableSeats: screen.totalSeats,
            totalSeats: screen.totalSeats
          });
          shows.push(show);
        }
      }
    }

    // Create seats for each show
    for (const show of shows) {
      const screen = await Screen.findById(show.screen);
      const seats = [];
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      const seatsPerRow = Math.floor(screen.totalSeats / rows.length);

      for (let i = 0; i < rows.length; i++) {
        for (let j = 1; j <= seatsPerRow; j++) {
          seats.push({
            show: show._id,
            row: rows[i],
            number: j,
            status: 'available'
          });
        }
      }

      await Seat.insertMany(seats);
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
