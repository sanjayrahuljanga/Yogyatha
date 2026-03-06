const mongoose = require('mongoose');
const translate = require('google-translate-api-x');
const Scheme = require('./models/Scheme'); // Make sure path is correct!

// Replace with your actual MongoDB URI
const MONGO_URI = 'mongodb://127.0.0.1:27017/yogyatha'; 

const translateArray = async (arr, targetLang) => {
    if (!arr || arr.length === 0) return [];
    try {
        const res = await translate(arr, { to: targetLang });
        return Array.isArray(res) ? res.map(r => r.text) : [res.text];
    } catch (err) {
        console.error(`Array Translation Error (${targetLang}):`, err);
        return arr; // return original English on failure
    }
};

const runTranslation = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to DB. Initiating Mass Translation...');

        const schemes = await Scheme.find({});
        console.log(`Found ${schemes.length} schemes. Beginning loop...`);

        for (let scheme of schemes) {
            console.log(`\nTranslating: ${scheme.name}`);

            // Initialize vault if missing
            if (!scheme.translations) {
                scheme.translations = { te: {}, hi: {} };
            }

            // --- TRANSLATE TO TELUGU (te) ---
            if (!scheme.translations.te.name || scheme.translations.te.name === '') {
                const teName = await translate(scheme.name, { to: 'te' });
                scheme.translations.te.name = teName.text;
                
                const teDesc = await translate(scheme.description || '', { to: 'te' });
                scheme.translations.te.description = teDesc.text;

                scheme.translations.te.applicationSteps = await translateArray(scheme.applicationSteps, 'te');
                scheme.translations.te.requiredDocs = await translateArray(scheme.requiredDocs, 'te');
                console.log('   🇮🇳 Telugu Translation Complete');
            }

            // --- TRANSLATE TO HINDI (hi) ---
            if (!scheme.translations.hi.name || scheme.translations.hi.name === '') {
                const hiName = await translate(scheme.name, { to: 'hi' });
                scheme.translations.hi.name = hiName.text;
                
                const hiDesc = await translate(scheme.description || '', { to: 'hi' });
                scheme.translations.hi.description = hiDesc.text;

                scheme.translations.hi.applicationSteps = await translateArray(scheme.applicationSteps, 'hi');
                scheme.translations.hi.requiredDocs = await translateArray(scheme.requiredDocs, 'hi');
                console.log('   🇮🇳 Hindi Translation Complete');
            }

            await scheme.save();
        }

        console.log('\n🚀 ALL SCHEMES SUCCESSFULLY TRANSLATED AND SAVED!');
        process.exit(0);

    } catch (error) {
        console.error('CRITICAL FAILURE:', error);
        process.exit(1);
    }
};

runTranslation();