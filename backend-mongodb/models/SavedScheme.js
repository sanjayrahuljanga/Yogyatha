const mongoose = require('mongoose');

const savedSchemeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  schemeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scheme',
    required: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicates and improve queries
savedSchemeSchema.index({ userId: 1, schemeId: 1 }, { unique: true });
savedSchemeSchema.index({ userId: 1 });
savedSchemeSchema.index({ schemeId: 1 });

module.exports = mongoose.model('SavedScheme', savedSchemeSchema);
