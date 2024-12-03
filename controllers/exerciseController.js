const Exercise = require('../models/exerciseModel');

exports.getExercises = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Mặc định page là 1
    const limit = parseInt(req.query.limit) || 10; // Mặc định limit là 10
    const skip = (page - 1) * limit; // Tính số lượng bản ghi cần bỏ qua
    const search = req.query.search || ""; // Lấy từ khóa tìm kiếm

    // Tạo điều kiện tìm kiếm
    const query = {
      name: { $regex: search, $options: "i" }, // Tìm kiếm không phân biệt hoa/thường
    };

    // Lấy danh sách các bài tập từ cơ sở dữ liệu
    const exercises = await Exercise.find(query)
      .skip(skip) // Bỏ qua số lượng bản ghi
      .limit(limit); // Giới hạn số lượng bản ghi trả về

    // Đếm tổng số bài tập khớp với từ khóa tìm kiếm
    const totalExercises = await Exercise.countDocuments(query);

    // Tính tổng số trang
    const totalPages = Math.ceil(totalExercises / limit);

    // Trả về kết quả
    res.status(200).json({
      exercises,
      totalItems: totalExercises, // Số lượng bài tập tổng cộng
      totalPages,                 // Tổng số trang
      currentPage: page,          // Trang hiện tại
    });
  } catch (err) {
    // Xử lý lỗi nếu có
    res.status(500).json({ message: 'Error fetching exercises', error: err.message });
  }
};


// Thêm bài tập mới
exports.createExercise = async (req, res) => {
  const { name, sets, timePerSet, restTimePerSet, exerciseImage, caloriesPerSet } = req.body;

  if (!name || !sets || !timePerSet || !restTimePerSet || !exerciseImage || !caloriesPerSet) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newExercise = new Exercise({
      name,
      sets,
      timePerSet,
      restTimePerSet,
      exerciseImage,
      caloriesPerSet, // Lưu caloriesPerSet
    });
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
