const express = require('express');
const SavedScheme = require('../models/SavedScheme');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get user's saved schemes
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    // Users can only get their own saved schemes
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied.' 
      });
    }
    
    const savedSchemes = await SavedScheme.find({ userId: req.params.userId })
      .populate('schemeId')
      .sort({ savedAt: -1 })
      .lean();
    
    res.json({
      success: true,
      savedSchemes: savedSchemes.map(item => item.schemeId)
    });
  } catch (error) {
    console.error('Get saved schemes error:', error);
    res.status(500).json({ success: false, message: 'Failed to get saved schemes' });
  }
});

// Save scheme for user
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { userId, schemeId } = req.body;
    
    // Users can only save schemes for themselves
    if (req.user.id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied.' 
      });
    }
    
    // Check if already saved
    const existingSaved = await SavedScheme.findOne({ 
      userId, 
      schemeId 
    });
    
    if (existingSaved) {
      return res.status(400).json({ 
        success: false, 
        message: 'Scheme already saved' 
      });
    }
    
    const savedScheme = new SavedScheme({
      userId,
      schemeId
    });
    
    await savedScheme.save();
    
    // Populate scheme details
    await savedScheme.populate('schemeId');
    
    res.status(201).json({
      success: true,
      message: 'Scheme saved successfully!',
      savedScheme
    });
  } catch (error) {
    console.error('Save scheme error:', error);
    res.status(500).json({ success: false, message: 'Failed to save scheme' });
  }
});

// Remove saved scheme
router.delete('/:schemeId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Users can only remove their own saved schemes
    if (req.user.id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied.' 
      });
    }
    
    const result = await SavedScheme.deleteOne({ 
      userId, 
      schemeId: req.params.schemeId 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Saved scheme not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Scheme removed from saved list'
    });
  } catch (error) {
    console.error('Remove saved scheme error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove saved scheme' });
  }
});

// Get saved schemes statistics
router.get('/:userId/stats', authMiddleware, async (req, res) => {
  try {
    // Users can only get their own statistics
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied.' 
      });
    }
    
    const [
      totalSaved,
      recentlySaved,
      savedByCategory
    ] = await Promise.all([
      SavedScheme.countDocuments({ userId: req.params.userId }),
      SavedScheme.find({ userId: req.params.userId })
        .populate('schemeId')
        .sort({ savedAt: -1 })
        .limit(5)
        .lean(),
      SavedScheme.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(req.params.userId) } },
        { $lookup: {
          from: 'schemes',
          localField: 'schemeId',
          foreignField: '_id',
          as: 'scheme'
        }},
        { $unwind: '$scheme' },
        { $group: { _id: '$scheme.category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);
    
    res.json({
      success: true,
      stats: {
        totalSaved,
        recentlySaved,
        savedByCategory
      }
    });
  } catch (error) {
    console.error('Get saved schemes stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get saved schemes statistics' });
  }
});

module.exports = router;
