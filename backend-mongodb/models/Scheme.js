const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema({
    // --- 🇬🇧 BASE ENGLISH FIELDS (Fallback) ---
    name: { type: String, required: true },
    category: { type: String, default: 'General' },
    state: { type: String, default: 'All India' },
    description: { type: String },
    link: { type: String },
    requiredDocs: { type: [String], default: [] },
    applicationSteps: { type: [String], default: [] },
    
    // --- 🌐 THE NEW POLYGLOT VAULT ---
    translations: {
        te: {
            name: { type: String, default: '' },
            description: { type: String, default: '' },
            requiredDocs: { type: [String], default: [] },
            applicationSteps: { type: [String], default: [] }
        },
        hi: {
            name: { type: String, default: '' },
            description: { type: String, default: '' },
            requiredDocs: { type: [String], default: [] },
            applicationSteps: { type: [String], default: [] }
        }
    },

    // --- 🧠 ELIGIBILITY RULES ENGINE ---
    rules: {
        minAge: { type: Number, default: 0 },
        maxAge: { type: Number, default: 100 },
        incomeLimit: { type: Number, default: 99999999 },
        targetGender: { type: String, default: 'All' },
        targetDifferentlyAbled: { type: String, default: 'All' }
    },
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Scheme', SchemeSchema);