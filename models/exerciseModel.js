const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, required: true, min: 1 },
  timePerSet: { type: Number, required: true, min: 5 }, // Tối thiểu 5 phút
  restTimePerSet: { type: Number, required: true, min: 3 }, // Tối thiểu 3 phút
  exerciseImage: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Exercise', exerciseSchema);
