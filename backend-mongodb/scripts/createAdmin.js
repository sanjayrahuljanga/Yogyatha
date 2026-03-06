const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yogyatha');
    console.log('✅ Connected to MongoDB');

    // --- CONFIGURATION ---
    const adminEmail = "sanjayrahulsanjayrahul5@gmail.com"; // The email you want to use
    const adminPassword = "admin123";        // The password you want to set
    const adminName = "Sanjay";
    // ---------------------

    // 1. Encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // 2. Find and Update (or Create if not found)
    const user = await User.findOneAndUpdate(
      { email: adminEmail },
      { 
        name: adminName,
        email: adminEmail,
        password: hashedPassword, // Save the ENCRYPTED password
        role: "admin",
        phone: "9999999999",
        state: "Admin HQ"
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    console.log(`\n🎉 SUCCESS!`);
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`🛡️ Role: ${user.role}`);
    console.log(`\nYou can now log in at the Admin Portal.`);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();