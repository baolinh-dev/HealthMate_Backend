const Exercise = require('../models/exerciseModel');

// Lấy danh sách bài tập
exports.getExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find();
    res.status(200).json(exercises);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching exercises', error: err.message });
  }
};

// Thêm bài tập mới
exports.createExercise = async (req, res) => {
  const { name, sets, timePerSet, restTimePerSet, exerciseImage } = req.body;

  if (!name || !sets || !timePerSet || !restTimePerSet || !exerciseImage) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newExercise = new Exercise({ name, sets, timePerSet, restTimePerSet, exerciseImage });
    await newExercise.save();
    res.status(201).json({ message: 'Exercise created successfully', exercise: newExercise });
  } catch (err) {
    res.status(500).json({ message: 'Error creating exercise', error: err.message });
  }
};

// Sửa bài tập
exports.updateExercise = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedExercise = await Exercise.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedExercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    res.status(200).json({ message: 'Exercise updated successfully', exercise: updatedExercise });
  } catch (err) {
    res.status(500).json({ message: 'Error updating exercise', error: err.message });
  }
};

// Xóa bài tập
exports.deleteExercise = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedExercise = await Exercise.findByIdAndDelete(id);
    if (!deletedExercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    res.status(200).json({ message: 'Exercise deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting exercise', error: err.message });
  }
};
