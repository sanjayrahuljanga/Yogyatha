const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Centralized secret

// --- 1. STANDARD LOGIN (WITH SUPREME COMMANDER OVERRIDE) ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Password' });

        // 🛡️ THE SUPREME COMMANDER OVERRIDE
        // This forces admin rights even if Mongoose hides the database field!
        const isSuperAdmin = user.email === 'admin@yogyatha.com' || user.isAdmin === true || user.get('isAdmin') === true;

        const payload = { user: { id: user.id, isAdmin: isSuperAdmin } };
        
        jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }, 
            (err, token) => {
                if (err) throw err;
                res.json({ 
                    token, 
                    user: { 
                        _id: user.id, 
                        name: user.name, 
                        email: user.email, 
                        phone: user.phone,
                        state: user.state,
                        isAdmin: isSuperAdmin 
                    } 
                });
            }
        );
    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// --- 2. REINFORCED REGISTRATION ROUTE ---
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, state } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'A citizen with this email already exists.' });
        }

        user = new User({
            name,
            email,
            password,
            phone: phone || '',
            state: state || 'All India'
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const isSuperAdmin = user.email === 'admin@yogyatha.com' || user.isAdmin === true;
        const payload = { user: { id: user.id, isAdmin: isSuperAdmin } };
        
        jwt.sign(
            payload, 
            JWT_SECRET, 
            { expiresIn: '7d' }, 
            (err, token) => {
                if (err) throw err;
                res.json({ 
                    token, 
                    user: { 
                        _id: user.id, 
                        name: user.name, 
                        email: user.email, 
                        phone: user.phone,
                        state: user.state,
                        isAdmin: isSuperAdmin 
                    } 
                });
            }
        );
    } catch (err) {
        console.error("Registration Error:", err.message);
        res.status(500).send('Server Error during registration');
    }
});

// --- 3. ADMIN COMMAND CENTER ROUTES ---
router.get('/all-users', async (req, res) => {
    try {
        const users = await User.find().select('-password'); 
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

router.post('/make-admin', async (req, res) => {
    try {
        const { identifier } = req.body;
        const user = await User.findOne({ email: identifier });
        if (!user) {
            return res.status(404).json({ error: "Citizen not found in the database." });
        }
        
        // Use standard mongoose update to bypass strict schema rules
        await User.updateOne({ _id: user._id }, { $set: { isAdmin: true } });
        res.json({ msg: `${user.name} has been granted Supreme Commander privileges!` });
    } catch (err) {
        console.error("Error making admin:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

// --- 4. FIREBASE PHONE BRIDGE ---
router.post('/phone-login', async (req, res) => {
    try {
        const { phone, uid } = req.body;
        if (!phone || !uid) return res.status(400).json({ msg: "Incomplete security data" });

        let cleanPhone = phone.startsWith('+91') ? phone.slice(3) : phone;
        let user = await User.findOne({ phone: cleanPhone });

        if (!user) {
            user = new User({
                name: "Citizen",
                phone: cleanPhone,
                email: `${cleanPhone}@phone.yogyatha.com`, 
                password: await bcrypt.hash(uid, 10), 
                firebaseUid: uid 
            });
            await user.save();
        } else if (!user.firebaseUid) {
            user.firebaseUid = uid;
            await user.save();
        }

        const isSuperAdmin = user.isAdmin === true || user.get('isAdmin') === true;
        const payload = { user: { id: user.id, isAdmin: isSuperAdmin } };
        
        jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { ...user._doc, isAdmin: isSuperAdmin } });
        });
    } catch (err) {
        console.error("Phone Login Strike Error:", err.message);
        res.status(500).send("Server Error during OTP Handshake");
    }
});

// --- 5. OTP PASSWORD RECOVERY ROUTES ---
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "Citizen not found." });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expireTime = Date.now() + 10 * 60 * 1000; 
        
        await User.updateOne(
            { _id: user._id },
            { $set: { resetOtp: otp, resetOtpExpire: expireTime } }
        );

        console.log(`\n========================================`);
        console.log(`🛡️ SECURITY OVERRIDE TRIGGERED`);
        console.log(`📧 OTP for ${user.email} is: ${otp}`);
        console.log(`========================================\n`);

        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'sanjayrahulsanjayrahul5@gmail.com', 
                    pass: 'jofj bfaj jazv zzcm' 
                }
            });

            const mailOptions = {
                from: 'Yogyatha Command Center',
                to: user.email,
                subject: 'Yogyatha - Your Password Reset OTP',
                text: `Hello ${user.name || 'Citizen'},\n\nYour OTP to reset your password is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\n- Yogyatha System`
            };

            await transporter.sendMail(mailOptions);
            res.json({ msg: "OTP sent successfully to your email." });
        } catch (emailError) {
            console.warn("⚠️ Email failed to send, but OTP was generated. Check terminal!");
            res.json({ msg: "Email system offline. Check backend terminal for OTP." });
        }

    } catch (err) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ msg: "Server error generating OTP." });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ 
            email, 
            resetOtp: otp, 
            resetOtpExpire: { $gt: Date.now() } 
        });

        if (!user) return res.status(400).json({ msg: "Invalid or expired OTP." });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        await User.updateOne(
            { _id: user._id },
            { 
                $set: { password: hashedPassword },
                $unset: { resetOtp: "", resetOtpExpire: "" }
            }
        );

        res.json({ msg: "Password has been successfully reset. You may now log in." });
    } catch (err) {
        console.error("Reset Password Error:", err);
        res.status(500).json({ msg: "Server Error" });
    }
});

module.exports = router;