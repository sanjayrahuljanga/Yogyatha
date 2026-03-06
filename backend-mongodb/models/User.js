const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    state: { type: String, default: 'All India' },
    
    // 🛡️ Admin Security Field
    isAdmin: { type: Boolean, default: false },

    firebaseUid: { type: String },
    
    // OTP Recovery Vault
    resetOtp: { type: String },
    resetOtpExpire: { type: Date },

    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('user', UserSchema);