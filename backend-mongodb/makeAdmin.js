const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yogyatha')
  .then(async () => {
    console.log('✅ Connected to DB');
    
    // REPLACE THIS WITH YOUR EMAIL
    const emailToPromote = "sanjayrahulsanjayrahul5@gmail.com"; 

    const user = await User.findOneAndUpdate(
      { email: emailToPromote },
      { role: "admin" },
      { new: true }
    );

    if (user) {
      console.log(`🎉 SUCCESS: ${user.name} is now an ADMIN!`);
    } else {
      console.log(`❌ User with email ${emailToPromote} not found.`);
    }
    process.exit();
  })
  .catch(err => console.log(err));