const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const EmergencyContact = require('../models/EmergencyContact');
const Message = require('../models/Message');
const RecognitionLog = require('../models/RecognitionLog');

dotenv.config();

const models = [
  User,
  EmergencyContact,
  Message,
  RecognitionLog
];

const initAtlas = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing in backend/.env');
  }

  await mongoose.connect(mongoUri);
  console.log(`Connected to MongoDB database: ${mongoose.connection.name}`);

  for (const model of models) {
    await model.createCollection();
    await model.syncIndexes();
    console.log(`Ready collection: ${model.collection.name}`);
  }

  console.log('Atlas database initialization complete.');
};

initAtlas()
  .catch((error) => {
    console.error('Atlas initialization failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
