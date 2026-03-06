const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Scheme = require('./models/Scheme');

dotenv.config();

const sampleSchemes = [
  {
    name: "PM Vishwakarma",
    category: "Skill Development",
    state: "All India",
    description: "A central sector scheme to support traditional artisans and craftspeople of rural and urban India. Provides financial support and skill training.",
    link: "https://pmvishwakarma.gov.in/",
    rules: { minAge: 18, maxAge: 50, incomeLimit: 500000, requiredOccupation: "Artisan" },
    applicationSteps: ["Register on PM Vishwakarma Portal", "Verify Aadhaar", "Skill Assessment"],
    isScraped: true
  },
  {
    name: "Jagananna Vidya Deevena",
    category: "Education",
    state: "Andhra Pradesh",
    description: "Full fee reimbursement for students from poor families pursuing higher education in Andhra Pradesh.",
    link: "https://jnanabhumi.ap.gov.in/",
    rules: { minAge: 16, maxAge: 35, incomeLimit: 250000, requiredOccupation: "Student" },
    applicationSteps: ["Apply at Grama Sachivalayam", "Submit Income Certificate", "College Verification"],
    isScraped: true
  },
  {
    name: "Pradhan Mantri Awas Yojana (Urban)",
    category: "Housing",
    state: "All India",
    description: "Provides central assistance to Urban Local Bodies (ULBs) and other implementing agencies for providing housing to all eligible families.",
    link: "https://pmay-urban.gov.in/",
    rules: { minAge: 18, maxAge: 70, incomeLimit: 1800000 },
    applicationSteps: ["Check eligibility list", "Apply online or via CSC", "Geo-tagging of house"],
    isScraped: true
  },
  {
    name: "Rythu Bharosa",
    category: "Agriculture",
    state: "Andhra Pradesh",
    description: "Financial assistance of Rs. 13,500 per year to farmer families including tenant farmers.",
    link: "https://ysrrythubharosa.ap.gov.in/",
    rules: { minAge: 18, maxAge: 70, requiredOccupation: "Farmer" },
    applicationSteps: ["Check name in beneficiary list", "Update e-KYC", "Link Bank Account"],
    isScraped: true
  },
  {
    name: "National Pension System (NPS)",
    category: "Pension",
    state: "All India",
    description: "A voluntary, defined contribution retirement savings scheme designed to enable systematic savings during the subscriber's working life.",
    link: "https://enps.nsdl.com/",
    rules: { minAge: 18, maxAge: 65 },
    applicationSteps: ["Register on eNPS", "Select Pension Fund Manager", "Make Contribution"],
    isScraped: true
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yogyatha');
    console.log('✅ Connected to MongoDB');

    // Optional: Clear existing scraped schemes to avoid duplicates
    // await Scheme.deleteMany({ isScraped: true });

    for (const s of sampleSchemes) {
      const exists = await Scheme.findOne({ name: s.name });
      if (!exists) {
        await Scheme.create(s);
        console.log(`✨ Added: ${s.name}`);
      } else {
        console.log(`⚠️ Skipped (Exists): ${s.name}`);
      }
    }
    
    console.log('🎉 Database Seeded Successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();