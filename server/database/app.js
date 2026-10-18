const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3030;

app.use(cors());
app.use(express.json());
app.use(require('body-parser').urlencoded({ extended: false }));

const dealerships_file = fs.existsSync('./data/dealerships.json')
  ? './data/dealerships.json'
  : 'dealerships.json';
const reviews_file = fs.existsSync('./data/reviews.json')
  ? './data/reviews.json'
  : 'reviews.json';

const dealerships_data = JSON.parse(fs.readFileSync(dealerships_file, 'utf8'));
const reviews_data = JSON.parse(fs.readFileSync(reviews_file, 'utf8'));

const Reviews = require('./review');
const Dealerships = require('./dealership');

const mongoUrl = process.env.MONGO_URL || 'mongodb://mongo_db:27017/';

mongoose.connect(mongoUrl, { dbName: 'dealershipsDB', serverSelectionTimeoutMS: 2000 })
  .then(async () => {
    console.log('Connected to MongoDB successfully.');
    try {
      await Reviews.deleteMany({});
      await Reviews.insertMany(reviews_data['reviews']);
      await Dealerships.deleteMany({});
      await Dealerships.insertMany(dealerships_data['dealerships']);
      console.log('Database seeded with dealerships and reviews.');
    } catch (err) {
      console.error('Error seeding database:', err);
    }
  })
  .catch(err => {
    console.log('MongoDB connection not available, operating with in-memory JSON fallback mode.');
  });

const isConnected = () => mongoose.connection.readyState === 1;

// Express route to home
app.get('/', async (req, res) => {
  res.send('Welcome to the Mongoose API');
});

// Express route to fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    if (isConnected()) {
      const documents = await Reviews.find();
      return res.json(documents);
    }
    res.json(reviews_data['reviews']);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch reviews by a particular dealer
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const dealerId = parseInt(req.params.id);
    if (isConnected()) {
      const documents = await Reviews.find({ dealership: dealerId });
      return res.json(documents);
    }
    const filtered = reviews_data['reviews'].filter(r => r.dealership === dealerId);
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
  try {
    if (isConnected()) {
      const documents = await Dealerships.find();
      return res.json(documents);
    }
    res.json(dealerships_data['dealerships']);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch Dealers by a particular state
app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const stateName = req.params.state;
    if (isConnected()) {
      const documents = await Dealerships.find({
        state: { $regex: new RegExp(`^${stateName}$`, 'i') }
      });
      return res.json(documents);
    }
    const filtered = dealerships_data['dealerships'].filter(
      d => d.state.toLowerCase() === stateName.toLowerCase()
    );
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch dealer by a particular id
app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const dealerId = parseInt(req.params.id);
    if (isConnected()) {
      const documents = await Dealerships.find({ id: dealerId });
      return res.json(documents);
    }
    const filtered = dealerships_data['dealerships'].filter(d => d.id === dealerId);
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to insert review
app.post('/insert_review', express.raw({ type: '*/*' }), async (req, res) => {
  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    let new_id = 1;

    if (isConnected()) {
      const documents = await Reviews.find().sort({ id: -1 });
      new_id = documents.length > 0 ? documents[0]['id'] + 1 : 1;

      const review = new Reviews({
        id: new_id,
        name: data['name'],
        dealership: parseInt(data['dealership']),
        review: data['review'],
        purchase: data['purchase'],
        purchase_date: data['purchase_date'],
        car_make: data['car_make'],
        car_model: data['car_model'],
        car_year: data['car_year'],
      });

      const savedReview = await review.save();
      return res.json(savedReview);
    }

    const currentReviews = reviews_data['reviews'];
    new_id = currentReviews.length > 0 ? Math.max(...currentReviews.map(r => r.id)) + 1 : 1;
    const newReview = {
      id: new_id,
      name: data['name'],
      dealership: parseInt(data['dealership']),
      review: data['review'],
      purchase: data['purchase'],
      purchase_date: data['purchase_date'],
      car_make: data['car_make'],
      car_model: data['car_model'],
      car_year: data['car_year'],
    };
    currentReviews.push(newReview);
    res.json(newReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error inserting review' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
