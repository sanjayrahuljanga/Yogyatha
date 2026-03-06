const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Scheme = require('../models/Scheme');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yogyatha', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB for seeding');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Seed data
const seedSchemes = [
  {
    name: "Pradhan Mantri Jan Dhan Yojana",
    description: "Banking access for all citizens",
    category: "Banking",
    state: "All India",
    eligibility: "All Indian citizens",
    benefits: "Zero balance account, debit card",
    requiredDocuments: ["Aadhar Card"],
    incomeLimit: "No limit",
    ageRange: "All ages",
    officialUrl: "https://pmjdy.gov.in/",
    minAge: 0,
    maxAge: 120,
    maxIncome: null,
    eligibleStates: ["All India"],
    eligibleCategories: ["Banking"],
    genderSpecific: "all",
    occupationSpecific: []
  },
  {
    name: "PM Kisan Samman Nidhi",
    description: "Income support for farmers",
    category: "Agriculture",
    state: "All India",
    eligibility: "Small and marginal farmers",
    benefits: "₹6,000 per year",
    requiredDocuments: ["Aadhar Card", "Land Records"],
    incomeLimit: "Below ₹3 lakh",
    ageRange: "18-65 years",
    officialUrl: "https://pmkisan.gov.in/",
    minAge: 18,
    maxAge: 65,
    maxIncome: 300000,
    eligibleStates: ["All India"],
    eligibleCategories: ["Agriculture"],
    genderSpecific: "all",
    occupationSpecific: ["farmer"]
  },
  {
    name: "Goa Domicile Scholarship",
    description: "Scholarship for Goa residents",
    category: "Education",
    state: "Goa",
    eligibility: "Goa domicile students",
    benefits: "Tuition fee waiver, stipend",
    requiredDocuments: ["Aadhar Card", "Domicile Certificate"],
    incomeLimit: "Below ₹8 lakh",
    ageRange: "16-25 years",
    officialUrl: "https://goa.gov.in/",
    minAge: 16,
    maxAge: 25,
    maxIncome: 800000,
    eligibleStates: ["Goa", "All India"],
    eligibleCategories: ["Education"],
    genderSpecific: "all",
    occupationSpecific: []
  },
  {
    name: "National Education Policy",
    description: "Scholarship for meritorious students",
    category: "Education",
    state: "All India",
    eligibility: "Students with 75%+ marks",
    benefits: "Scholarship for higher education",
    requiredDocuments: ["Aadhar Card", "Marksheet", "Income Certificate"],
    incomeLimit: "Below ₹8 lakh",
    ageRange: "18-25 years",
    officialUrl: "https://www.education.gov.in/",
    minAge: 18,
    maxAge: 25,
    maxIncome: 800000,
    eligibleStates: ["All India"],
    eligibleCategories: ["Education"],
    genderSpecific: "all",
    occupationSpecific: []
  },
  {
    name: "Ayushman Bharat Health Insurance",
    description: "Health insurance for poor families",
    category: "Healthcare",
    state: "All India",
    eligibility: "Families below poverty line",
    benefits: "₹5 lakh health coverage",
    requiredDocuments: ["Aadhar Card", "BPL Card"],
    incomeLimit: "Below ₹2.5 lakh",
    ageRange: "All ages",
    officialUrl: "https://pmjay.gov.in/",
    minAge: 0,
    maxAge: 120,
    maxIncome: 250000,
    eligibleStates: ["All India"],
    eligibleCategories: ["Healthcare"],
    genderSpecific: "all",
    occupationSpecific: []
  },
  {
    name: "Pradhan Mantri Awas Yojana",
    description: "Housing for all",
    category: "Housing",
    state: "All India",
    eligibility: "All citizens without house",
    benefits: "Housing subsidy",
    requiredDocuments: ["Aadhar Card", "Income Certificate"],
    incomeLimit: "Below ₹18 lakh",
    ageRange: "All ages",
    officialUrl: "https://pmaymis.gov.in/",
    minAge: 18,
    maxAge: 70,
    maxIncome: 1800000,
    eligibleStates: ["All India"],
    eligibleCategories: ["Housing"],
    genderSpecific: "all",
    occupationSpecific: []
  }
];

const seedUsers = [
  {
    name: "Admin User",
    email: "admin@yogyatha.com",
    phone: "9999999999",
    password: "admin123", // In production, this should be hashed
    role: "admin"
  }
];

// Seed function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Scheme.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Seed schemes
    const insertedSchemes = await Scheme.insertMany(seedSchemes);
    console.log(`✅ Inserted ${insertedSchemes.length} schemes`);

    // Seed users
    const insertedUsers = await User.insertMany(seedUsers);
    console.log(`✅ Inserted ${insertedUsers.length} users`);

    console.log('🎉 Database seeding completed successfully!');
    
    // Close connection
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
