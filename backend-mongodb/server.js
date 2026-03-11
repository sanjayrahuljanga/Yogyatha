const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// DB Connection
mongoose.connect(process.env.MONGODB_URI, 'mongodb+srv://sanjayrahulsanjayrahul5_db_user:kxq3Zz84vbjFg4uC@cluster0.cf7hb6r.mongodb.net/yogyatha?appName=Cluster0')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ DB Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/schemes', require('./routes/schemes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));