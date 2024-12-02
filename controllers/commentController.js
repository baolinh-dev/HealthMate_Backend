const Blog = require('../models/blogModel'); 
const User = require('../models/userModel');
// Thêm bình luận
const addComment = async (req, res) => {
  try {
    const { blogId, content } = req.body;
    const userId = req.user._id; // Lấy ID người dùng từ token đã xác thực

    if (!content || !blogId) {
      return res.status(400).json({ message: "Blog ID và nội dung bình luận là bắt buộc." });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog không tồn tại." });
    }

    // Thêm bình luận vào blog
    const comment = { userId, content, createdAt: new Date() };
    blog.comments.push(comment);
    await blog.save();

    // Trả về dữ liệu bình luận cùng tên người dùng
    const user = await User.findById(userId).select("name");
    res.status(201).json({
      message: "Thêm bình luận thành công.",
      comment: {
        _id: blog.comments[blog.comments.length - 1]._id,
        content,
        user: { _id: user._id, name: user.name },
        createdAt: comment.createdAt,
      },
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi thêm bình luận." });
  }
};


module.exports = { addComment};
