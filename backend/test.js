const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const EmergencyContact = require('./models/EmergencyContact');
const Message = require('./models/Message');
const RecognitionLog = require('./models/RecognitionLog');

// Load env configurations
dotenv.config();

const runVerification = async () => {
  console.log('=== STARTING BACKEND INTEGRATION VERIFICATION ===');
  
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sign_interpreter';
  console.log(`Connecting to database: ${mongoUri}`);
  
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connection established successfully.');

    // 1. Seed Test Admin User
    let admin = await User.findOne({ email: 'admin@gmail.com' });
    if (!admin) {
      admin = await User.create({
        username: 'admin',
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Seeded Default Admin User: admin@gmail.com / admin123');
    } else {
      console.log('Default Admin User already exists.');
    }

    // 2. Seed Test Regular User
    let user = await User.findOne({ email: 'user@gmail.com' });
    if (!user) {
      user = await User.create({
        username: 'johndoe',
        email: 'user@gmail.com',
        password: 'user123',
        role: 'user'
      });
      console.log('Seeded Default Regular User: user@gmail.com / user123');
    } else {
      console.log('Default Regular User already exists.');
    }

    // 3. Test Emergency Contact creation
    console.log('Testing emergency contacts schema validation...');
    await EmergencyContact.deleteMany({ userId: user._id }); // clear previous test data
    
    const contact = await EmergencyContact.create({
      userId: user._id,
      name: 'Jane Doe',
      phone: '+15005550006',
      relationship: 'Mother',
      isPrimary: true
    });
    console.log(`Successfully created test emergency contact: ${contact.name} (${contact.phone})`);

    // 4. Test Chat Log creation
    console.log('Testing conversation messages schema validation...');
    const message = await Message.create({
      userId: user._id,
      sender: 'deaf_user',
      messageType: 'sign',
      content: 'HELLO WORLD'
    });
    console.log(`Successfully created test chat message: "${message.content}"`);

    // 5. Test Recognition Log creation
    console.log('Testing recognition logs schema validation...');
    const log = await RecognitionLog.create({
      userId: user._id,
      signRecognized: 'H',
      confidence: 0.96,
      signLanguageType: 'ISL'
    });
    console.log(`Successfully created test recognition log: ${log.signRecognized} (Conf: ${log.confidence * 100}%)`);

    console.log('\n================================================');
    console.log('  ALL SCHEMAS AND DATABASE CALLS VALIDATED OK!  ');
    console.log('================================================');

  } catch (error) {
    console.error('\nVerification failed with error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

runVerification();
