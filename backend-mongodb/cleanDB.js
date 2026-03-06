const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const clean = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yogyatha');
  console.log('✅ Connected');
  
  // DELETE THE SPECIFIC USER
  await User.deleteOne({ email: "sanjayrahulsanjayrahul5@gmail.com" });
  console.log('🗑️ Deleted old user data.');
  
  process.exit();
};

clean();