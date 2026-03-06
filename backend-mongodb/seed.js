const mongoose = require('mongoose');
const Scheme = require('./models/Scheme');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yogyatha')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ DB Error:', err));

const sampleSchemes = [
  {
    name: "PM Kisan Samman Nidhi",
    description: "Financial benefit of Rs. 6000/- per year to eligible farmer families.",
    category: "Agriculture",
    state: "All India",
    eligibility: "Small and marginal farmers",
    benefits: "Rs. 6000 per year",
    requiredDocuments: ["Aadhaar", "Land Records", "Bank Passbook"],
    incomeLimit: "None",
    ageRange: "18-100",
    isActive: true,
    minAge: 18,
    maxAge: 100,
    eligibleStates: ["All India"],
    eligibleCategories: ["Farmer"],
    genderSpecific: "all"
  },
  {
    name: "Jagananna Vidya Deevena",
    description: "Full fee reimbursement for students from poor families.",
    category: "Education",
    state: "Andhra Pradesh",
    eligibility: "Students with family income < 2.5 Lakhs",
    benefits: "100% Fee Reimbursement",
    requiredDocuments: ["Income Cert", "Caste Cert", "Aadhaar"],
    incomeLimit: "250000",
    ageRange: "16-35",
    isActive: true,
    minAge: 16,
    maxAge: 35,
    maxIncome: 250000,
    eligibleStates: ["Andhra Pradesh"],
    eligibleCategories: ["Student"],
    genderSpecific: "all"
  },
  {
    name: "Arogyasri",
    description: "Free healthcare for families below poverty line.",
    category: "Health",
    state: "Andhra Pradesh",
    eligibility: "White Ration Card Holders",
    benefits: "Free medical treatment up to 5 Lakhs",
    requiredDocuments: ["White Ration Card", "Aadhaar"],
    incomeLimit: "500000",
    ageRange: "0-100",
    isActive: true,
    minAge: 0,
    maxAge: 100,
    maxIncome: 500000,
    eligibleStates: ["Andhra Pradesh"],
    eligibleCategories: ["All"],
    genderSpecific: "all"
  }
];

const seedDB = async () => {
  await Scheme.deleteMany({});
  await Scheme.insertMany(sampleSchemes);
  console.log("🌱 Database seeded with 3 schemes!");
  process.exit();
};

seedDB();