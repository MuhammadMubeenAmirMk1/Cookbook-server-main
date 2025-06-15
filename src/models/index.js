const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const basename = path.basename(__filename);
const db = {};

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI not found in .env file');
  process.exit(1);
}

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connection established successfully.');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Dynamically import all models
fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      !file.includes('.test.js')
  )
  .forEach((file) => {
    const model = require(path.join(__dirname, file));
    db[model.modelName] = model;
  });

module.exports = db;
