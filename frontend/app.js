const API_BASE = 'http://localhost:5000/api';

let currentUser = null;
let selectedSeats = [];
let currentShow = null;
let selectedCityId = null;
let currentMovie = null;
let bookings = [];
let movies = [];
let movieDetails = {};
let numPersons = 1;

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadCities();
    selectedCityId = localStorage.getItem('selectedCityId') || 1; // Default to Chennai if no city selected
    document.getElementById('citySelect').value = selectedCityId;
    loadMovies();
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('movie');
    if (movieId && selectedCityId) {
        showMovieDescription(movieId);
    }
});

function setupEventListeners() {
    document.getElementById('loginBtn').addEventListener('click', showLogin);
    document.getElementById('submitLogin').addEventListener('click', login);
    document.getElementById('citySelect').addEventListener('change', () => selectCity(document.getElementById('citySelect').value));
    document.getElementById('trailerBtn').addEventListener('click', watchTrailer);
    document.getElementById('wishlistBtn').addEventListener('click', addToWishlist);
    document.getElementById('proceedToBookingBtn').addEventListener('click', proceedToBooking);
    document.getElementById('proceedToSeatsBtn').addEventListener('click', proceedToSeats);
    document.getElementById('backToMoviesBtn').addEventListener('click', goBackToMovies);
    document.getElementById('proceedToConfirmationBtn').addEventListener('click', proceedToBookingConfirmation);
    document.getElementById('confirmBookBtn').addEventListener('click', confirmBooking);
    document.getElementById('bookNowBtn').addEventListener('click', bookNow);
    document.getElementById('bookNowFromBookingBtn').addEventListener('click', bookNowFromBooking);
    document.getElementById('backToMoviesFromSuccessBtn').addEventListener('click', backToMoviesFromSuccess);
}

function showLogin() {
    document.getElementById('auth').classList.remove('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
}

function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    // Mock login - always succeed
    currentUser = { id: 1, username: username };
    localStorage.setItem('token', 'mock_token');
    showDashboard();
}

function showDashboard() {
    document.getElementById('auth').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('nav').innerHTML = `
        <button id="logoutBtn">Logout</button>
        <button id="myBookingsBtn">My Bookings</button>
    `;
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('myBookingsBtn').addEventListener('click', showBookings);
    loadCities();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('token');
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('nav').innerHTML = `
        <button id="loginBtn">Login</button>
    `;
    setupEventListeners();
}

async function loadCities() {
    const cities = [
        { id: 1, name: 'Chennai' },
        { id: 2, name: 'Mumbai' },
        { id: 3, name: 'Hyderabad' },
        { id: 4, name: 'Kolkata' },
        { id: 5, name: 'Salem' },
        { id: 6, name: 'Trichy' },
        { id: 7, name: 'Madurai' },
        { id: 8, name: 'Coimbatore' }
    ];
    const select = document.getElementById('citySelect');
    select.innerHTML = '<option value="">Select a city</option>';
    cities.forEach(city => {
        select.innerHTML += `<option value="${city.id}">${city.name}</option>`;
    });
}

function selectCity(cityId) {
    selectedCityId = cityId;
    localStorage.setItem('selectedCityId', cityId);
    loadMovies();
}

async function loadMovies() {
    if (!selectedCityId) return;

    const cityMovies = {
        1: [ // Chennai
            { id: 41, title: 'Thangalaan', description: 'Tamil historical action film', rating: '8.5/10', releaseDate: 'Aug 15, 2024' },
            { id: 42, title: 'Viduthalai Part 2', description: 'Tamil political thriller sequel', rating: '8.7/10', releaseDate: 'Nov 29, 2024' },
            { id: 43, title: 'Amaran', description: 'Tamil biographical war film', rating: '8.3/10', releaseDate: 'Oct 31, 2024' },
            { id: 44, title: 'Lubber Pandhu', description: 'Tamil comedy film', rating: '7.6/10', releaseDate: 'Dec 2024' },
            { id: 45, title: 'Japan', description: 'Tamil action thriller', rating: '7.9/10', releaseDate: 'Nov 1, 2024' }
        ],
        2: [ // Mumbai
            { id: 51, title: 'Fighter', description: 'Hindi action film', rating: '8.0/10', releaseDate: 'Jan 25, 2024' },
            { id: 52, title: 'Dunki', description: 'Hindi comedy-drama', rating: '7.8/10', releaseDate: 'Dec 21, 2023' },
            { id: 53, title: 'Animal', description: 'Hindi action film', rating: '8.2/10', releaseDate: 'Dec 1, 2023' },
            { id: 54, title: 'Bade Miyan Chote Miyan', description: 'Hindi action comedy', rating: '7.6/10', releaseDate: 'Apr 11, 2024' },
            { id: 55, title: 'Crew', description: 'Hindi action thriller', rating: '7.9/10', releaseDate: 'Mar 29, 2024' }
        ],
        3: [ // Hyderabad
            { id: 46, title: 'Guntur Kaaram', description: 'Telugu action film', rating: '7.8/10', releaseDate: 'Jan 12, 2024' },
            { id: 47, title: 'Devara', description: 'Telugu action drama', rating: '8.1/10', releaseDate: 'Sep 27, 2024' },
            { id: 48, title: 'Salaar', description: 'Telugu action film', rating: '8.4/10', releaseDate: 'Dec 22, 2023' },
            { id: 49, title: 'Hanuman', description: 'Telugu animated film', rating: '8.2/10', releaseDate: 'Jan 12, 2024' },
            { id: 50, title: 'Tillu Square', description: 'Telugu comedy film', rating: '7.5/10', releaseDate: 'Mar 29, 2024' }
        ],
        4: [ // Kolkata
            { id: 56, title: 'Jawan', description: 'Hindi action film', rating: '7.5/10', releaseDate: 'Sep 7, 2023' },
            { id: 57, title: 'Pathaan', description: 'Hindi action thriller', rating: '7.8/10', releaseDate: 'Jan 25, 2023' },
            { id: 58, title: 'Tiger 3', description: 'Hindi action film', rating: '7.6/10', releaseDate: 'Nov 12, 2023' },
            { id: 59, title: 'Dunki', description: 'Hindi comedy-drama', rating: '7.8/10', releaseDate: 'Dec 21, 2023' },
            { id: 60, title: 'Animal', description: 'Hindi action film', rating: '8.2/10', releaseDate: 'Dec 1, 2023' }
        ],
        5: [ // Salem
            { id: 66, title: 'Garudan', description: 'Tamil action film', rating: '7.8/10', releaseDate: 'May 31, 2024' },
            { id: 67, title: 'Parking', description: 'Tamil comedy film', rating: '7.4/10', releaseDate: 'Dec 29, 2023' },
            { id: 68, title: 'Blue Star', description: 'Tamil action film', rating: '7.6/10', releaseDate: 'Dec 15, 2024' },
            { id: 69, title: 'Lover', description: 'Tamil romantic film', rating: '7.5/10', releaseDate: 'Apr 12, 2024' },
            { id: 70, title: 'Jailer', description: 'Tamil action film', rating: '8.1/10', releaseDate: 'Aug 10, 2023' }
        ],
        6: [ // Trichy
            { id: 61, title: 'Captain Miller', description: 'Tamil action film', rating: '8.1/10', releaseDate: 'Jan 12, 2024' },
            { id: 62, title: 'Ayalaan', description: 'Tamil sci-fi film', rating: '7.9/10', releaseDate: 'Jan 12, 2024' },
            { id: 63, title: 'Rathnam', description: 'Tamil action film', rating: '7.7/10', releaseDate: 'Feb 23, 2024' },
            { id: 64, title: 'Maharaja', description: 'Tamil action thriller', rating: '8.3/10', releaseDate: 'Mar 1, 2024' },
            { id: 65, title: 'Chithha', description: 'Tamil action film', rating: '8.0/10', releaseDate: 'Sep 28, 2023' }
        ],
        7: [ // Madurai
            { id: 71, title: 'Vaathi', description: 'Tamil action film', rating: '7.9/10', releaseDate: 'Feb 17, 2024' },
            { id: 72, title: 'Don', description: 'Tamil action film', rating: '7.7/10', releaseDate: 'May 5, 2023' },
            { id: 73, title: 'Dada', description: 'Tamil action film', rating: '7.8/10', releaseDate: 'Feb 9, 2023' },
            { id: 74, title: 'Kadaisi Ulaga Por', description: 'Tamil sci-fi film', rating: '8.0/10', releaseDate: 'Sep 29, 2023' },
            { id: 75, title: 'Pichaikkaran 2', description: 'Tamil action film', rating: '7.6/10', releaseDate: 'Sep 15, 2023' }
        ],
        8: [ // Coimbatore
            { id: 1, title: 'Dhurandhar', description: 'Hindi action-thriller film (big release)', rating: '7.5/10', releaseDate: 'Dec 2024' },
            { id: 2, title: 'Kombuseevi', description: 'Tamil mass entertainer (releasing Dec 19)', rating: '8.2/10', releaseDate: 'Dec 19, 2024' },
            { id: 3, title: 'Retta Thala', description: 'Tamil action thriller (releasing Dec 25)', rating: '7.8/10', releaseDate: 'Dec 25, 2024' },
            { id: 4, title: 'Sirai', description: 'Tamil drama-thriller (Dec 25)', rating: '8.0/10', releaseDate: 'Dec 25, 2024' },
            { id: 5, title: 'Angammal', description: 'Tamil drama (released Dec 5)', rating: '7.9/10', releaseDate: 'Dec 5, 2024' }
        ]
    };

    movieDetails = {
        1: { language: 'Hindi', duration: '2h 30m', genre: 'Action | Thriller', shortDescription: 'A gripping action-thriller film.', trailerUrl: '#', wishlist: false },
        2: { language: 'Tamil', duration: '2h 40m', genre: 'Action | Comedy', shortDescription: 'A mass entertainer with action and comedy.', trailerUrl: '#', wishlist: false },
        3: { language: 'Tamil', duration: '2h 35m', genre: 'Action | Thriller', shortDescription: 'An intense action thriller.', trailerUrl: '#', wishlist: false },
        4: { language: 'Tamil', duration: '2h 25m', genre: 'Drama | Thriller', shortDescription: 'A drama-thriller with twists.', trailerUrl: '#', wishlist: false },
        5: { language: 'Tamil', duration: '2h 20m', genre: 'Drama', shortDescription: 'An emotional drama.', trailerUrl: '#', wishlist: false },
        41: { language: 'Tamil', duration: '2h 40m', genre: 'Action | Historical', shortDescription: 'A fierce tale of resistance, power, and survival set in the colonial era.', trailerUrl: '#', wishlist: false },
        42: { language: 'Tamil', duration: '2h 50m', genre: 'Crime | Drama', shortDescription: 'An intense continuation of the fight against oppression and injustice.', trailerUrl: '#', wishlist: false },
        43: { language: 'Tamil', duration: '2h 35m', genre: 'Action | Drama', shortDescription: 'A powerful action drama based on real events, showcasing courage, sacrifice, and patriotism.', trailerUrl: '#', wishlist: false },
        44: { language: 'Tamil', duration: '2h 10m', genre: 'Sports | Drama', shortDescription: 'A heartwarming story about friendship, ambition, and street-level cricket.', trailerUrl: '#', wishlist: false },
        45: { language: 'Tamil', duration: '2h 20m', genre: 'Thriller | Crime', shortDescription: 'A stylish crime thriller revolving around robberies and hidden motives.', trailerUrl: '#', wishlist: false },
        46: { language: 'Telugu', duration: '2h 40m', genre: 'Action | Family', shortDescription: 'A mass entertainer filled with powerful dialogues and emotions.', trailerUrl: '#', wishlist: false },
        47: { language: 'Telugu', duration: '2h 45m', genre: 'Action | Drama', shortDescription: 'A high-octane coastal action drama with strong emotions.', trailerUrl: '#', wishlist: false },
        48: { language: 'Telugu', duration: '2h 55m', genre: 'Action | Thriller', shortDescription: 'A violent and gripping saga of power, loyalty, and revenge.', trailerUrl: '#', wishlist: false },
        49: { language: 'Telugu', duration: '2h 30m', genre: 'Fantasy | Action', shortDescription: 'A modern superhero story inspired by Indian mythology.', trailerUrl: '#', wishlist: false },
        50: { language: 'Telugu', duration: '2h 10m', genre: 'Comedy | Romance', shortDescription: 'A hilarious sequel packed with romance and quirky moments.', trailerUrl: '#', wishlist: false },
        51: { language: 'Hindi', duration: '2h 45m', genre: 'Action | Patriotism', shortDescription: 'An adrenaline-packed aerial action film celebrating the Indian Air Force.', trailerUrl: '#', wishlist: false },
        52: { language: 'Hindi', duration: '2h 30m', genre: 'Comedy | Drama', shortDescription: 'A light-hearted yet emotional journey about dreams, migration, and hope.', trailerUrl: '#', wishlist: false },
        53: { language: 'Hindi', duration: '3h 20m', genre: 'Action | Crime', shortDescription: 'A dark, intense father-son story driven by violence and obsession.', trailerUrl: '#', wishlist: false },
        54: { language: 'Hindi', duration: '2h 35m', genre: 'Action | Comedy', shortDescription: 'A high-energy entertainer mixing action, humor, and patriotism.', trailerUrl: '#', wishlist: false },
        55: { language: 'Hindi', duration: '2h 05m', genre: 'Comedy | Drama', shortDescription: 'A fun, bold story of three women navigating ambition and chaos.', trailerUrl: '#', wishlist: false },
        56: { language: 'Hindi', duration: '2h 50m', genre: 'Action | Thriller', shortDescription: 'A vigilante action film with a strong social message.', trailerUrl: '#', wishlist: false },
        57: { language: 'Hindi', duration: '2h 25m', genre: 'Action | Spy', shortDescription: 'A high-octane spy thriller with global stakes.', trailerUrl: '#', wishlist: false },
        58: { language: 'Hindi', duration: '2h 35m', genre: 'Action | Spy', shortDescription: 'A deadly mission tests loyalty and patriotism.', trailerUrl: '#', wishlist: false },
        59: { language: 'Hindi', duration: '2h 30m', genre: 'Comedy | Drama', shortDescription: 'A heartfelt journey of dreams beyond borders.', trailerUrl: '#', wishlist: false },
        60: { language: 'Hindi', duration: '3h 20m', genre: 'Crime | Action', shortDescription: 'A brutal emotional drama exploring obsession and violence.', trailerUrl: '#', wishlist: false },
        61: { language: 'Tamil', duration: '2h 40m', genre: 'Action | Period', shortDescription: 'A rebellious outlaw rises against British rule.', trailerUrl: '#', wishlist: false },
        62: { language: 'Tamil', duration: '2h 30m', genre: 'Sci-Fi | Comedy', shortDescription: 'A fun sci-fi adventure involving aliens and friendship.', trailerUrl: '#', wishlist: false },
        63: { language: 'Tamil', duration: '2h 35m', genre: 'Action | Drama', shortDescription: 'A powerful action story driven by loyalty and justice.', trailerUrl: '#', wishlist: false },
        64: { language: 'Tamil', duration: '2h 20m', genre: 'Thriller | Drama', shortDescription: 'A gripping revenge drama with unexpected twists.', trailerUrl: '#', wishlist: false },
        65: { language: 'Tamil', duration: '2h 10m', genre: 'Emotional | Drama', shortDescription: 'A deeply emotional story about love, care, and responsibility.', trailerUrl: '#', wishlist: false },
        66: { language: 'Tamil', duration: '2h 20m', genre: 'Action | Thriller', shortDescription: 'A raw action thriller centered on crime and redemption.', trailerUrl: '#', wishlist: false },
        67: { language: 'Tamil', duration: '2h 05m', genre: 'Drama | Thriller', shortDescription: 'A realistic conflict drama arising from a simple parking issue.', trailerUrl: '#', wishlist: false },
        68: { language: 'Tamil', duration: '2h 15m', genre: 'Sports | Drama', shortDescription: 'A moving sports drama about identity, caste, and passion.', trailerUrl: '#', wishlist: false },
        69: { language: 'Tamil', duration: '2h 10m', genre: 'Romance | Drama', shortDescription: 'A realistic portrayal of modern relationships and heartbreak.', trailerUrl: '#', wishlist: false },
        70: { language: 'Tamil', duration: '2h 45m', genre: 'Action | Drama', shortDescription: 'A retired jailer returns to action to protect his family.', trailerUrl: '#', wishlist: false },
        71: { language: 'Tamil', duration: '2h 15m', genre: 'Drama | Education', shortDescription: 'A teacher\'s fight to uplift students through education.', trailerUrl: '#', wishlist: false },
        72: { language: 'Tamil', duration: '2h 25m', genre: 'Comedy | Drama', shortDescription: 'A fun-filled campus story with emotional depth.', trailerUrl: '#', wishlist: false },
        73: { language: 'Tamil', duration: '2h 10m', genre: 'Family | Drama', shortDescription: 'A touching single-father story filled with emotions.', trailerUrl: '#', wishlist: false },
        74: { language: 'Tamil', duration: '2h 20m', genre: 'Political | Thriller', shortDescription: 'A bold take on politics and modern warfare.', trailerUrl: '#', wishlist: false },
        75: { language: 'Tamil', duration: '2h 30m', genre: 'Action | Drama', shortDescription: 'A sequel focusing on transformation, power, and fate.', trailerUrl: '#', wishlist: false }
    };

movies = cityMovies[selectedCityId] || [];

const showsData = {
    1: { // Chennai
        41: [
            { id: 11, theater_name: 'AGS Cinemas Chennai', screen_name: 'Screen 1', show_time: '2024-08-15T18:00:00', price: 15 },
            { id: 12, theater_name: 'SPI Cinemas Chennai', screen_name: 'Screen 1', show_time: '2024-08-15T20:00:00', price: 15 }
        ],
        42: [
            { id: 13, theater_name: 'Sathyam Cinemas Chennai', screen_name: 'Screen 1', show_time: '2024-11-29T18:00:00', price: 15 },
            { id: 14, theater_name: 'Escape Cinemas Chennai', screen_name: 'Screen 1', show_time: '2024-11-29T20:00:00', price: 15 }
        ],
        43: [
            { id: 15, theater_name: 'Rohini Silver Screens Chennai', screen_name: 'Screen 1', show_time: '2024-10-31T18:00:00', price: 15 },
            { id: 16, theater_name: 'Devi Cineplex Chennai', screen_name: 'Screen 1', show_time: '2024-10-31T20:00:00', price: 15 }
        ],
        44: [
            { id: 17, theater_name: 'Cinepolis Chennai', screen_name: 'Screen 1', show_time: '2024-12-01T18:00:00', price: 15 },
            { id: 18, theater_name: 'Carnival Cinemas Chennai', screen_name: 'Screen 1', show_time: '2024-12-01T20:00:00', price: 15 }
        ],
        45: [
            { id: 19, theater_name: 'GVK One Cinemas Chennai', screen_name: 'Screen 1', show_time: '2024-11-01T18:00:00', price: 15 },
            { id: 20, theater_name: 'Prasads Multiplex Chennai', screen_name: 'Screen 1', show_time: '2024-11-01T20:00:00', price: 15 }
        ]
    },
    2: { // Mumbai
        51: [
            { id: 21, theater_name: 'AGS Cinemas Mumbai', screen_name: 'Screen 1', show_time: '2024-01-25T18:00:00', price: 15 },
            { id: 22, theater_name: 'SPI Cinemas Mumbai', screen_name: 'Screen 1', show_time: '2024-01-25T20:00:00', price: 15 }
        ],
        52: [
            { id: 23, theater_name: 'Sathyam Cinemas Mumbai', screen_name: 'Screen 1', show_time: '2023-12-21T18:00:00', price: 15 },
            { id: 24, theater_name: 'Escape Cinemas Mumbai', screen_name: 'Screen 1', show_time: '2023-12-21T20:00:00', price: 15 }
        ],
        53: [
            { id: 25, theater_name: 'Rohini Silver Screens Mumbai', screen_name: 'Screen 1', show_time: '2023-12-01T18:00:00', price: 15 },
            { id: 26, theater_name: 'Devi Cineplex Mumbai', screen_name: 'Screen 1', show_time: '2023-12-01T20:00:00', price: 15 }
        ],
        54: [
            { id: 27, theater_name: 'Cinepolis Mumbai', screen_name: 'Screen 1', show_time: '2024-04-11T18:00:00', price: 15 },
            { id: 28, theater_name: 'Carnival Cinemas Mumbai', screen_name: 'Screen 1', show_time: '2024-04-11T20:00:00', price: 15 }
        ],
        55: [
            { id: 29, theater_name: 'GVK One Cinemas Mumbai', screen_name: 'Screen 1', show_time: '2024-03-29T18:00:00', price: 15 },
            { id: 30, theater_name: 'Prasads Multiplex Mumbai', screen_name: 'Screen 1', show_time: '2024-03-29T20:00:00', price: 15 }
        ]
    },
    3: { // Hyderabad
        46: [
            { id: 31, theater_name: 'AGS Cinemas Hyderabad', screen_name: 'Screen 1', show_time: '2024-01-12T18:00:00', price: 15 },
            { id: 32, theater_name: 'SPI Cinemas Hyderabad', screen_name: 'Screen 1', show_time: '2024-01-12T20:00:00', price: 15 }
        ],
        47: [
            { id: 33, theater_name: 'Sathyam Cinemas Hyderabad', screen_name: 'Screen 1', show_time: '2024-09-27T18:00:00', price: 15 },
            { id: 34, theater_name: 'Escape Cinemas Hyderabad', screen_name: 'Screen 1', show_time: '2024-09-27T20:00:00', price: 15 }
        ],
        48: [
            { id: 35, theater_name: 'Rohini Silver Screens Hyderabad', screen_name: 'Screen 1', show_time: '2023-12-22T18:00:00', price: 15 },
            { id: 36, theater_name: 'Devi Cineplex Hyderabad', screen_name: 'Screen 1', show_time: '2023-12-22T20:00:00', price: 15 }
        ],
        49: [
            { id: 37, theater_name: 'Cinepolis Hyderabad', screen_name: 'Screen 1', show_time: '2024-01-12T18:00:00', price: 15 },
            { id: 38, theater_name: 'Carnival Cinemas Hyderabad', screen_name: 'Screen 1', show_time: '2024-01-12T20:00:00', price: 15 }
        ],
        50: [
            { id: 39, theater_name: 'GVK One Cinemas Hyderabad', screen_name: 'Screen 1', show_time: '2024-03-29T18:00:00', price: 15 },
            { id: 40, theater_name: 'Prasads Multiplex Hyderabad', screen_name: 'Screen 1', show_time: '2024-03-29T20:00:00', price: 15 }
        ]
    },
    4: { // Kolkata
        56: [
            { id: 41, theater_name: 'AGS Cinemas Kolkata', screen_name: 'Screen 1', show_time: '2023-09-07T18:00:00', price: 15 },
            { id: 42, theater_name: 'SPI Cinemas Kolkata', screen_name: 'Screen 1', show_time: '2023-09-07T20:00:00', price: 15 }
        ],
        57: [
            { id: 43, theater_name: 'Sathyam Cinemas Kolkata', screen_name: 'Screen 1', show_time: '2023-01-25T18:00:00', price: 15 },
            { id: 44, theater_name: 'Escape Cinemas Kolkata', screen_name: 'Screen 1', show_time: '2023-01-25T20:00:00', price: 15 }
        ],
        58: [
            { id: 45, theater_name: 'Rohini Silver Screens Kolkata', screen_name: 'Screen 1', show_time: '2023-11-12T18:00:00', price: 15 },
            { id: 46, theater_name: 'Devi Cineplex Kolkata', screen_name: 'Screen 1', show_time: '2023-11-12T20:00:00', price: 15 }
        ],
        59: [
            { id: 47, theater_name: 'Cinepolis Kolkata', screen_name: 'Screen 1', show_time: '2023-12-21T18:00:00', price: 15 },
            { id: 48, theater_name: 'Carnival Cinemas Kolkata', screen_name: 'Screen 1', show_time: '2023-12-21T20:00:00', price: 15 }
        ],
        60: [
            { id: 49, theater_name: 'GVK One Cinemas Kolkata', screen_name: 'Screen 1', show_time: '2023-12-01T18:00:00', price: 15 },
            { id: 50, theater_name: 'Prasads Multiplex Kolkata', screen_name: 'Screen 1', show_time: '2023-12-01T20:00:00', price: 15 }
        ]
    },
    5: { // Salem
        66: [
            { id: 51, theater_name: 'AGS Cinemas Salem', screen_name: 'Screen 1', show_time: '2024-05-31T18:00:00', price: 10 },
            { id: 52, theater_name: 'SPI Cinemas Salem', screen_name: 'Screen 1', show_time: '2024-05-31T20:00:00', price: 10 }
        ],
        67: [
            { id: 53, theater_name: 'Sathyam Cinemas Salem', screen_name: 'Screen 1', show_time: '2023-12-29T18:00:00', price: 10 },
            { id: 54, theater_name: 'Escape Cinemas Salem', screen_name: 'Screen 1', show_time: '2023-12-29T20:00:00', price: 10 }
        ],
        68: [
            { id: 55, theater_name: 'Rohini Silver Screens Salem', screen_name: 'Screen 1', show_time: '2024-12-15T18:00:00', price: 10 },
            { id: 56, theater_name: 'Devi Cineplex Salem', screen_name: 'Screen 1', show_time: '2024-12-15T20:00:00', price: 10 }
        ],
        69: [
            { id: 57, theater_name: 'Cinepolis Salem', screen_name: 'Screen 1', show_time: '2024-04-12T18:00:00', price: 10 },
            { id: 58, theater_name: 'Carnival Cinemas Salem', screen_name: 'Screen 1', show_time: '2024-04-12T20:00:00', price: 10 }
        ],
        70: [
            { id: 59, theater_name: 'GVK One Cinemas Salem', screen_name: 'Screen 1', show_time: '2023-08-10T18:00:00', price: 10 },
            { id: 60, theater_name: 'Prasads Multiplex Salem', screen_name: 'Screen 1', show_time: '2023-08-10T20:00:00', price: 10 }
        ]
    },
    6: { // Trichy
        61: [
            { id: 61, theater_name: 'AGS Cinemas Trichy', screen_name: 'Screen 1', show_time: '2024-01-12T18:00:00', price: 10 },
            { id: 62, theater_name: 'SPI Cinemas Trichy', screen_name: 'Screen 1', show_time: '2024-01-12T20:00:00', price: 10 }
        ],
        62: [
            { id: 63, theater_name: 'Sathyam Cinemas Trichy', screen_name: 'Screen 1', show_time: '2024-01-12T18:00:00', price: 10 },
            { id: 64, theater_name: 'Escape Cinemas Trichy', screen_name: 'Screen 1', show_time: '2024-01-12T20:00:00', price: 10 }
        ],
        63: [
            { id: 65, theater_name: 'Rohini Silver Screens Trichy', screen_name: 'Screen 1', show_time: '2024-02-23T18:00:00', price: 10 },
            { id: 66, theater_name: 'Devi Cineplex Trichy', screen_name: 'Screen 1', show_time: '2024-02-23T20:00:00', price: 10 }
        ],
        64: [
            { id: 67, theater_name: 'Cinepolis Trichy', screen_name: 'Screen 1', show_time: '2024-03-01T18:00:00', price: 10 },
            { id: 68, theater_name: 'Carnival Cinemas Trichy', screen_name: 'Screen 1', show_time: '2024-03-01T20:00:00', price: 10 }
        ],
        65: [
            { id: 69, theater_name: 'GVK One Cinemas Trichy', screen_name: 'Screen 1', show_time: '2023-09-28T18:00:00', price: 10 },
            { id: 70, theater_name: 'Prasads Multiplex Trichy', screen_name: 'Screen 1', show_time: '2023-09-28T20:00:00', price: 10 }
        ]
    },
    7: { // Madurai
    71: [
        { id: 71, theater_name: 'AGS Cinemas Madurai', screen_name: 'Screen 1', show_time: '2024-02-17T18:00:00', price: 10 },
        { id: 72, theater_name: 'SPI Cinemas Madurai', screen_name: 'Screen 1', show_time: '2024-02-17T20:00:00', price: 10 }
    ],
    72: [
        { id: 73, theater_name: 'AGS Cinemas Madurai', screen_name: 'Screen 1', show_time: '2023-05-05T18:00:00', price: 10 },
        { id: 74, theater_name: 'SPI Cinemas Madurai', screen_name: 'Screen 1', show_time: '2023-05-05T20:00:00', price: 10 }
    ],
    73: [
        { id: 75, theater_name: 'AGS Cinemas Madurai', screen_name: 'Screen 1', show_time: '2023-02-09T18:00:00', price: 10 },
        { id: 76, theater_name: 'SPI Cinemas Madurai', screen_name: 'Screen 1', show_time: '2023-02-09T20:00:00', price: 10 }
    ],
    74: [
        { id: 77, theater_name: 'AGS Cinemas Madurai', screen_name: 'Screen 1', show_time: '2023-09-29T18:00:00', price: 10 },
        { id: 78, theater_name: 'SPI Cinemas Madurai', screen_name: 'Screen 1', show_time: '2023-09-29T20:00:00', price: 10 }
    ],
    75: [
        { id: 79, theater_name: 'AGS Cinemas Madurai', screen_name: 'Screen 1', show_time: '2023-09-15T18:00:00', price: 10 },
        { id: 80, theater_name: 'SPI Cinemas Madurai', screen_name: 'Screen 1', show_time: '2023-09-15T20:00:00', price: 10 }
    ]
    },
    8: { // Coimbatore
        1: [
            { id: 81, theater_name: 'PVR Coimbatore', screen_name: 'Screen 1', show_time: '2024-12-20T18:00:00', price: 10 },
            { id: 82, theater_name: 'INOX Coimbatore', screen_name: 'Screen 1', show_time: '2024-12-20T20:00:00', price: 10 }
        ],
        2: [
            { id: 83, theater_name: 'PVR Coimbatore', screen_name: 'Screen 1', show_time: '2024-12-19T18:00:00', price: 10 },
            { id: 84, theater_name: 'INOX Coimbatore', screen_name: 'Screen 1', show_time: '2024-12-19T20:00:00', price: 10 }
        ],
        3: [
            { id: 85, theater_name: 'PVR Coimbatore', screen_name: 'Screen 1', show_time: '2024-12-25T18:00:00', price: 10 },
            { id: 86, theater_name: 'INOX Coimbatore', screen_name: 'Screen 1', show_time: '2024-12-25T20:00:00', price: 10 }
        ],
        4: [
            { id: 87, theater_name: 'PVR Coimbatore', screen_name: 'Screen 1', show_time: '2024-12-25T18:00:00', price: 10 },
            { id: 88, theater_name: 'INOX Coimbatore', screen_name: 'Screen 1', show_time: '2024-12-25T20:00:00', price: 10 }
        ],
        5: [
            { id: 89, theater_name: 'PVR Coimbatore', screen_name: 'Screen 1', show_time: '2024-12-05T18:00:00', price: 10 },
            { id: 90, theater_name: 'INOX Coimbatore', screen_name: 'Screen 1', show_time: '2024-12-05T20:00:00', price: 10 }
        ]
    }
};

const seatsData = {};
// Collect all show IDs from showsData
const allShowIds = new Set();
Object.values(showsData).forEach(cityShows => {
    Object.values(cityShows).forEach(shows => {
        shows.forEach(show => allShowIds.add(show.id));
    });
});

allShowIds.forEach(showId => {
    seatsData[showId] = [];
    for (let r = 0; r < 2; r++) {
        for (let n = 1; n <= 10; n++) {
            seatsData[showId].push({
                id: (showId - 1) * 20 + r * 10 + n,
                row: String.fromCharCode(65 + r),
                number: n,
                status: 'available'
            });
        }
    }
    // Randomly set some seats as booked
    const numBooked = Math.floor(Math.random() * 5) + 1; // 1 to 5 booked seats
    for (let j = 0; j < numBooked; j++) {
        const randomIndex = Math.floor(Math.random() * seatsData[showId].length);
        seatsData[showId][randomIndex].status = 'booked';
    }
});
    const container = document.getElementById('movies');
    container.innerHTML = '';
    movies.forEach(movie => {
        container.innerHTML += `
            <div class="movie">
                <h3>${movie.title}</h3>
                <p>${movie.description}</p>
                <p>Rating: ${movie.rating} | Release Date: ${movie.releaseDate}</p>
                <button onclick="showMovieDescription(${movie.id})">Book Now</button>
            </div>
        `;
    });
    document.getElementById('movieList').classList.remove('hidden');
}

function loadShows(movieId) {
    const shows = showsData[selectedCityId]?.[movieId] || [];
    const container = document.getElementById('shows');
    container.innerHTML = '';
    shows.forEach(show => {
        container.innerHTML += `
            <div class="show">
                <h3 onclick="loadSeats(${show.id})">${show.theater_name}</h3>
                <p>Screen: ${show.screen_name}</p>
                <p>Time: ${new Date(show.show_time).toLocaleString()}</p>
                <p>Price: $${show.price}</p>
                <button onclick="loadSeats(${show.id})">Book Now</button>
            </div>
        `;
    });
    document.getElementById('showList').classList.remove('hidden');
}

function loadSeats(showId) {
    currentShow = showId;
    selectedSeats = [];

    // Use mock seats data
    const seats = seatsData[showId] || [];
    const container = document.getElementById('seats');
    container.innerHTML = '';

    // Group seats by row
    const rows = {};
    seats.forEach(seat => {
        if (!rows[seat.row]) rows[seat.row] = [];
        rows[seat.row].push(seat);
    });

    // Create row elements
    Object.keys(rows).sort().forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'seat-row';

        const label = document.createElement('div');
        label.className = 'seat-row-label';
        label.textContent = row;
        rowDiv.appendChild(label);

        rows[row].forEach(seat => {
            const seatEl = document.createElement('div');
            seatEl.className = `seat ${seat.status}`;
            seatEl.textContent = seat.number;
            seatEl.onclick = () => selectSeat(seat.id, seatEl);
            rowDiv.appendChild(seatEl);
        });

        container.appendChild(rowDiv);
    });

    document.getElementById('showList').classList.add('hidden');
    document.getElementById('seatSelection').classList.remove('hidden');
}

function selectSeat(seatId, element) {
    if (element.classList.contains('booked') || element.classList.contains('locked')) return;

    if (selectedSeats.includes(seatId)) {
        selectedSeats = selectedSeats.filter(id => id !== seatId);
        element.classList.remove('selected');
    } else {
        selectedSeats.push(seatId);
        element.classList.add('selected');
    }
}

async function bookTickets() {
    if (selectedSeats.length === 0) {
        alert('Please select seats');
        return;
    }

    // Calculate total amount (assuming $10 per seat for simplicity)
    const totalAmount = selectedSeats.length * 10;

    try {
        const response = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                showId: currentShow,
                seatIds: selectedSeats,
                totalAmount: totalAmount,
                paymentId: 'PAY_' + Date.now() // Mock payment ID
            })
        });

        if (response.ok) {
            alert('Booking successful!');
            loadSeats(currentShow); // Refresh seats
        } else {
            alert('Booking failed');
        }
    } catch (error) {
        console.error('Booking error:', error);
    }
}

async function showBookings() {
    try {
        const response = await fetch(`${API_BASE}/bookings`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const bookings = await response.json();
        const container = document.getElementById('bookings');
        container.innerHTML = '';
        bookings.forEach(booking => {
            container.innerHTML += `
                <div class="booking">
                    <h3>${booking.movie_title}</h3>
                    <p>Theater: ${booking.theater_name}</p>
                    <p>Show Time: ${new Date(booking.show_time).toLocaleString()}</p>
                    <p>Seats: ${booking.seats}</p>
                    <p>Total: $${booking.total_amount}</p>
                    <button onclick="cancelBooking(${booking.id})">Cancel</button>
                </div>
            `;
        });
        document.getElementById('bookingHistory').classList.remove('hidden');
    } catch (error) {
        console.error('Load bookings error:', error);
    }
}

async function cancelBooking(bookingId) {
    try {
        const response = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            alert('Booking cancelled');
            showBookings();
        } else {
            alert('Cancellation failed');
        }
    } catch (error) {
        console.error('Cancel booking error:', error);
    }
}

function showMovieDescription(movieId) {
    currentMovie = movieId;
    const movie = movies.find(m => m.id == movieId);
    const details = movieDetails[movieId];
    if (!movie || !details) {
        console.error('Movie or details not found for id:', movieId);
        return;
    }
    document.getElementById('movieTitle').innerHTML = movie.title;
    document.getElementById('movieDetails').innerHTML = `
        <button id="backToMoviesBtn">Back to Movies</button>
        <p><strong>Language:</strong> ${details.language}</p>
        <p><strong>Duration:</strong> ${details.duration}</p>
        <p><strong>Genre:</strong> ${details.genre}</p>
        <p><strong>Description:</strong> ${details.shortDescription}</p>
        <p><strong>Rating:</strong> ${movie.rating}</p>
        <p><strong>Release Date:</strong> ${movie.releaseDate}</p>
        <button id="trailerBtn">Watch Trailer</button>
        <button id="wishlistBtn">Add to Wishlist</button>
        <button id="proceedToBookingBtn">Proceed to Booking</button>
    `;
    document.getElementById('backToMoviesBtn').addEventListener('click', goBackToMovies);
    document.getElementById('trailerBtn').addEventListener('click', watchTrailer);
    document.getElementById('wishlistBtn').addEventListener('click', addToWishlist);
    document.getElementById('proceedToBookingBtn').addEventListener('click', proceedToBooking);
    document.getElementById('movieDescription').classList.remove('hidden');
    document.getElementById('movieList').classList.add('hidden');
}

function watchTrailer() {
    alert('Trailer functionality not implemented yet.');
}

function addToWishlist() {
    alert('Added to wishlist!');
}

function proceedToBooking() {
    document.getElementById('movieDescription').classList.add('hidden');
    document.getElementById('bookingPage').classList.remove('hidden');
    document.getElementById('bookingMovieTitle').textContent = movies.find(m => m.id == currentMovie).title;
}

function proceedToSeats() {
    numPersons = parseInt(document.getElementById('numPersons').value);
    if (numPersons < 1 || numPersons > 10) {
        alert('Number of persons must be between 1 and 10');
        return;
    }
    document.getElementById('bookingPage').classList.add('hidden');
    // Load the first available show for the movie
    const shows = showsData[selectedCityId]?.[currentMovie] || [];
    if (shows.length > 0) {
        loadSeats(shows[0].id);
    } else {
        alert('No shows available for this movie.');
    }
}

function proceedToBookingConfirmation() {
    if (selectedSeats.length === 0) {
        alert('Please select seats');
        return;
    }
    const selectedSeatsDisplay = selectedSeats.map(seatId => {
        const seat = seatsData[currentShow].find(s => s.id === seatId);
        return `${seat.row}${seat.number}`;
    }).join(', ');
    document.getElementById('selectedSeatsDisplay').textContent = selectedSeatsDisplay;
    document.getElementById('numPersonsConfirm').value = numPersons;
    document.getElementById('seatSelection').classList.add('hidden');
    document.getElementById('bookingConfirmation').classList.remove('hidden');
}

async function confirmBooking() {
    const numPersonsConfirm = parseInt(document.getElementById('numPersonsConfirm').value);
    if (numPersonsConfirm < 1 || numPersonsConfirm > 10) {
        alert('Number of persons must be between 1 and 10');
        return;
    }
    numPersons = numPersonsConfirm;

    // Calculate total amount (assuming $10 per seat for simplicity)
    const totalAmount = selectedSeats.length * 10;

    try {
        const response = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                showId: currentShow,
                seatIds: selectedSeats,
                totalAmount: totalAmount,
                paymentId: 'PAY_' + Date.now() // Mock payment ID
            })
        });

        if (response.ok) {
            alert('Booked successfully!');
            // Hide confirmation and show success page
            document.getElementById('bookingConfirmation').classList.add('hidden');
            document.getElementById('bookingSuccess').classList.remove('hidden');
            selectedSeats = [];
            currentShow = null;
        } else {
            alert('Booking failed');
        }
    } catch (error) {
        console.error('Booking error:', error);
    }
}

function goBackToMovies() {
    document.getElementById('movieDescription').classList.add('hidden');
    document.getElementById('movieList').classList.remove('hidden');
}

function backToMoviesFromSuccess() {
    document.getElementById('bookingSuccess').classList.add('hidden');
    document.getElementById('movieList').classList.remove('hidden');
}

function bookNow() {

    numPersons = parseInt(document.getElementById('numPersons').value);

    if (!numPersons || numPersons < 1 || numPersons > 10) {
        alert('Please select number of persons');
        return;
    }

    alert('🎉 Booked successfully!');

    // Optional UI reset
    document.getElementById('bookingPage').classList.add('hidden');
    document.getElementById('movieList').classList.remove('hidden');
}



function bookNowFromBooking() {
    alert('Booked successfully!');
    // Hide booking page and show success page
    document.getElementById('bookingPage').classList.add('hidden');
    document.getElementById('bookingSuccess').classList.remove('hidden');
}
