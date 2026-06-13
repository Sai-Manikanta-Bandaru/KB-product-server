require('dotenv').config();
const db = require('../src/config/db');
const User = require('../src/models/User');

async function main() {
  try {
    const name = process.env.ADMIN_NAME || process.argv[2];
    const email = (process.env.ADMIN_EMAIL || process.argv[3] || '').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || process.argv[4];

    if (!name || !email || !password) {
      console.error('Usage: provide ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD env vars or pass as args: name email password');
      process.exit(1);
    }

    // Wait for mongoose connection established by db module
    // db exports mongoose; ensure connection is ready
    const existing = await User.findOne({ email }).exec();
    if (existing) {
      console.log('User already exists:', existing.email);
      process.exit(0);
    }

    const user = new User({ name, email, password });
    await user.save();
    console.log('User created:', { id: user._id, email: user.email, name: user.name });
    process.exit(0);
  } catch (err) {
    console.error('Error creating user:', err && err.message);
    process.exit(1);
  }
}

main();
