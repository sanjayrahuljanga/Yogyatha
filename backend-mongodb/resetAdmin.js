const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const reset = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yogyatha');
  
  // 1. Delete the old buggy admin
  await User.deleteOne({ email: 'admin@yogyatha.com' });

  // 2. Create Fresh Admin
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);

  const admin = new User({
    name: 'Super Admin',
    email: 'admin@yogyatha.com',
    password: hashedPassword,
    role: 'admin'
  });

  await admin.save();
  console.log('✅ Admin Created: admin@yogyatha.com / admin123');
  process.exit();
};

reset();