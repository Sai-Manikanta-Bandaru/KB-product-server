const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dooh-mvp';

async function connect() {
  try {
    // Newer mongoose versions ignore deprecated options like
    // `useNewUrlParser` and `useUnifiedTopology`. Pass the URI only.
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
}

mongoose.connection.on('connected', () => console.log('Mongoose: connected'));
mongoose.connection.on('error', (err) => console.error('Mongoose error:', err && err.message));
mongoose.connection.on('disconnected', () => console.warn('Mongoose: disconnected'));

connect();

module.exports = mongoose;
