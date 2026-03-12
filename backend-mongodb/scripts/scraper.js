const mongoose = require('mongoose');
const Scheme = require('../models/Scheme');
const dotenv = require('dotenv');

// Load environment variables (to get MONGO_URI)
dotenv.config(); // Ensure you run this from backend-mongodb root

const scrapeSchemes = async () => {
  console.log("🕷️  Starting Yogyatha Web Scraper...");

  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI );
    console.log("✅ Connected to Database. Fetching new schemes...");

    // 2. THE SCRAPING LOGIC (Simulated for Demo)
    // In a real scenario, you would use axios.get(url) and cheerio.load(response.data)
    // Here, we define the "Perfect Data" we want to find.
    const newSchemesFound = [
      {
        name: "PM Vishwakarma Yojana",
        category: "Skill Development",
        state: "All India",
        desc: "A central sector scheme to support traditional artisans and craftspeople of rural and urban India.",
        link: "https://pmvishwakarma.gov.in/",
        rules: { minAge: 18, maxAge: 50, gender: "All", incomeLimit: 500000, requiredOccupation: "Artisan" },
        steps: [
            "Register on PM Vishwakarma Portal.",
            "Verify Aadhaar and Mobile Number.",
            "Fill out the artisan application form.",
            "Download the ID Card and Certificate."
        ],
        docs: ["Aadhaar Card", "Bank Account Details", "Skill Certificate"]
      },
      {
        name: "Jagananna Vidya Deevena",
        category: "Education",
        state: "Andhra Pradesh",
        desc: "Full fee reimbursement for students from poor families pursuing higher education.",
        link: "https://jnanabhumi.ap.gov.in/",
        rules: { minAge: 16, maxAge: 35, gender: "All", incomeLimit: 250000, requiredOccupation: "Student" },
        steps: [
            "Apply through Grama Sachivalayam.",
            "Submit Income Certificate and Ration Card.",
            "College verifies the application.",
            "Amount credited to mother's bank account."
        ],
        docs: ["Income Certificate", "Ration Card", "Aadhaar Card", "Bank Passbook"]
      },
      {
        name: "Rythu Bharosa",
        category: "Agriculture",
        state: "Andhra Pradesh",
        desc: "Financial assistance of Rs. 13,500 per year to farmer families.",
        link: "https://ysrrythubharosa.ap.gov.in/",
        rules: { minAge: 18, maxAge: 70, gender: "All", incomeLimit: 500000, requiredOccupation: "Farmer" },
        steps: [
            "Check name in beneficiary list at RBK.",
            "Update e-KYC status.",
            "Ensure bank account is Aadhaar linked."
        ],
        docs: ["Pattadar Passbook", "Aadhaar Card"]
      }
    ];

    // 3. Save to Database (Duplicate Check)
    let addedCount = 0;
    
    for (const data of newSchemesFound) {
      // Check if scheme with this name already exists
      const exists = await Scheme.findOne({ name: data.name });
      
      if (!exists) {
        await Scheme.create({
          name: data.name,
          category: data.category,
          state: data.state,
          description: data.desc,
          link: data.link,
          rules: data.rules, // Saves the nested object
          applicationSteps: data.steps, // Saves the array
          requiredDocs: data.docs,
          isScraped: true
        });
        console.log(`✨ Added New Scheme: ${data.name}`);
        addedCount++;
      } else {
        console.log(`⚠️  Skipped (Already Exists): ${data.name}`);
      }
    }

    console.log(`\n🎉 Scraping Complete! Added ${addedCount} new schemes.`);

  } catch (error) {
    console.error("❌ Scraping Failed:", error);
  } finally {
    mongoose.connection.close();
    process.exit();
  }
};

// Run the function
scrapeSchemes();