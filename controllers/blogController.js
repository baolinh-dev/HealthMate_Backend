const Blog = require('../models/blogModel'); // Đường dẫn model Blog

// Thêm blog
const addBlog = async (req, res) => {
  try {
    const { title, content, image, status } = req.body;
    const authorId = req.user._id; // Lấy authorId từ thông tin người dùng đã đăng nhập

    // Tạo blog mới
    const newBlog = new Blog({
      title,
      content,
      image,
      authorId,
      status: status || 'draft', // Mặc định là 'draft' nếu không truyền
    });

    await newBlog.save();
    res.status(201).send({
      message: 'Blog created successfully',
      blog: newBlog,
    });
  } catch (err) {
    res.status(500).send({ message: 'Server error', error: err.message });
  }
};

module.exports = { addBlog };
