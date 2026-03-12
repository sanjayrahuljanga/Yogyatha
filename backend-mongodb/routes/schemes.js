const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Scheme = require('../models/Scheme');
const { spawn } = require('child_process');
const path = require('path');

// ==========================================
// 1. GET ALL SCHEMES (With Strict Bouncer)
// ==========================================
router.get('/', async (req, res) => {
  try {
    let schemes = await Scheme.find().sort({ createdAt: -1 });

    // 🕵️‍♂️ GRAB THE SEARCH PARAMETERS
    const { gender, age, isDifferentlyAbled } = req.query;

    if (gender || age || isDifferentlyAbled) {
      console.log(`🔍 Bouncer checking: Gender=${gender}, Age=${age}, Disabled=${isDifferentlyAbled}`);

      schemes = schemes.filter(s => {
        const rules = s.rules || {};

        // 🛑 1. GENDER FILTER (The STRICT Match)
        if (gender && rules.targetGender && rules.targetGender !== 'All') {
            const userGender = gender.toLowerCase().trim(); 
            const schemeTarget = rules.targetGender.toLowerCase().trim(); 
            
            let cleanTarget = schemeTarget.replace('only', '').trim();
            if (cleanTarget === 'women') cleanTarget = 'female';
            if (cleanTarget === 'men') cleanTarget = 'male';

            let cleanUser = userGender;
            if (cleanUser === 'women') cleanUser = 'female';
            if (cleanUser === 'men') cleanUser = 'male';

            if (cleanTarget !== cleanUser) {
                return false;
            }
        }

        // 🛑 2. AGE FILTER
        if (age && age !== 'undefined' && age !== '') {
          const userAge = parseInt(age);
          if (userAge < rules.minAge || userAge > rules.maxAge) return false;
        }
        
        // 🛑 3. DISABILITY FILTER
        if (isDifferentlyAbled && isDifferentlyAbled !== 'All' && rules.targetDifferentlyAbled !== 'All') {
           if (String(isDifferentlyAbled) !== String(rules.targetDifferentlyAbled)) return false;
        }

        return true;
      });
    }

    res.json({ schemes });
  } catch (err) {
    console.error("Filter Error:", err);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 2. ADD A NEW SCHEME (Admin Only)
// ==========================================
router.post('/', auth, async (req, res) => {
  try {
    // 🎯 THE FIX: Check for isAdmin instead of role!
    if (!req.user.isAdmin) return res.status(403).json({ msg: 'Admins Only' });

    const newScheme = new Scheme(req.body);
    const scheme = await newScheme.save();
    res.json(scheme);
  } catch (err) {
    console.error("Save Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 3. SCRAPE URL (Admin Only) - BULLETPROOF VERSION
// ==========================================
router.post('/scrape-url', auth, (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ msg: "Admins only" });
    
    const { url } = req.body;
    if (!url) return res.status(400).json({ msg: "URL is required" });

    console.log(`🚀 Scraping Specific URL: ${url}`);

   const scriptPath = path.join(__dirname, '..', 'scrapers', 'myschemes_scraper.py');
    const pythonCommand = process.platform === "win32" ? "python" : "python3";
    
    let pythonProcess;
    try {
        pythonProcess = spawn(pythonCommand, [scriptPath, url]);
    } catch (err) {
        console.error("Failed to start Python:", err);
        return res.status(500).json({ msg: "Server Error: Could not launch Python scraper engine." });
    }

    let dataBuffer = "";

    // 🛡️ NEW: Catch Python Launch Errors so Node doesn't crash!
    pythonProcess.on('error', (err) => {
        console.error("❌ Python Launch Error:", err.message);
        if (!res.headersSent) {
            res.status(500).json({ msg: "Failed to launch Python. Is Python installed and added to PATH?" });
        }
    });

    pythonProcess.stdout.on('data', (data) => {
        dataBuffer += data.toString();
    });

    // 🛡️ NEW: Catch Python execution errors (like missing modules)
    pythonProcess.stderr.on('data', (data) => {
        console.error(`⚠️ Python Error Log: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Python script exited with code ${code}`);
            if (!res.headersSent) {
                return res.status(500).json({ msg: "Python scraper crashed during execution." });
            }
        }

        try {
            const jsonStartIndex = dataBuffer.indexOf('{');
            const jsonEndIndex = dataBuffer.lastIndexOf('}');
            
            if (jsonStartIndex === -1) {
                console.error("❌ No JSON found in Python output. Output was:", dataBuffer);
                return res.status(500).json({ msg: "Scraper did not return valid JSON." });
            }
            
            const cleanJson = dataBuffer.substring(jsonStartIndex, jsonEndIndex + 1);
            const schemeData = JSON.parse(cleanJson);

            if (schemeData.error) {
                return res.status(500).json({ msg: "Scraper failed to read the page", details: schemeData.error });
            }

            res.json(schemeData);
        } catch (err) {
            console.error("❌ Scraper Parse Error. Raw Output:", dataBuffer);
            if (!res.headersSent) {
                res.status(500).json({ msg: "Failed to extract data from that URL." });
            }
        }
    });
});
// ==========================================
// 4. UPDATE A SCHEME (Admin Only)
// ==========================================
router.put('/:id', auth, async (req, res) => {
    try {
        // 🎯 THE FIX: Check for isAdmin instead of role!
        if (!req.user.isAdmin) return res.status(403).json({ msg: 'Admins Only' });

        const updatedScheme = await Scheme.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true } 
        );
        
        res.json(updatedScheme);
    } catch (err) {
        console.error("Update Error:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// ==========================================
// 5. DELETE A SCHEME (Admin Only)
// ==========================================
router.delete('/:id', auth, async (req, res) => {
    try {
        // 🎯 THE FIX: Check for isAdmin instead of role!
        if (!req.user.isAdmin) return res.status(403).json({ msg: 'Admins Only' });
        
        const scheme = await Scheme.findById(req.params.id);
        if (!scheme) return res.status(404).json({ msg: 'Scheme not found' });

        await Scheme.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Scheme erased completely' });
    } catch (err) {
        console.error("Delete Error:", err.message);
        res.status(500).json({ error: "Server Error during deletion" });
    }
});

module.exports = router;