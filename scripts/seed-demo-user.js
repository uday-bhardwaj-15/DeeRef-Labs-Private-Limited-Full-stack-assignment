const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Connect to MongoDB
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pdf-annotator');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// User Schema
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const createDemoUser = async () => {
  try {
    // Check if demo user already exists
    const existingUser = await User.findOne({ email: 'demo@example.com' });
    
    if (existingUser) {
      console.log('Demo user already exists');
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('demo123', salt);

    // Create demo user
    const demoUser = new User({
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo User',
    });

    await demoUser.save();
    console.log('Demo user created successfully');
    console.log('Email: demo@example.com');
    console.log('Password: demo123');
  } catch (error) {
    console.error('Error creating demo user:', error);
  } finally {
    await mongoose.connection.close();
  }
};

const run = async () => {
  await connectToDatabase();
  await createDemoUser();
};

run();