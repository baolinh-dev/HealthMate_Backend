const Blog = require('../models/blogModel'); 


const addBlog = async (req, res) => {
  try {
    const { title, content, image, status } = req.body;
    const authorId = req.user._id; 

    const newBlog = new Blog({
      title,
      content,
      image,
      authorId,
      status: status || 'draft', 
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


const updateBlogUser = async (req, res) => {
  try {
    const blogId = req.params.id; 
    const { title, content, image } = req.body; 

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (req.user._id.toString() !== blog.authorId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to edit this blog' });
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.image = image || blog.image;

    await blog.save();
    res.status(200).json({
      message: 'Blog updated successfully',
      blog,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateBlogAdmin = async (req, res) => {
  try {
    const blogId = req.params.id; 
    const { title, content, image, status } = req.body; 

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to edit this blog' });
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.image = image || blog.image;
    blog.status = status || blog.status;

    await blog.save();
    res.status(200).json({
      message: 'Blog updated successfully',
      blog,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' })  // Tìm tất cả bài blog
      .populate('authorId', 'name email role')  // Populate thông tin tác giả
      .populate('comments.userId', 'name') // Populate tên người dùng bình luận
      .exec();

    // Process the blogs to ensure the 'authorId' and 'comments.userId' are properly formatted
    const result = blogs.map(blog => ({
      ...blog.toObject(),
      author: blog.authorId,  // Add author details to a new 'author' field
      authorId: undefined,    // Remove the original 'authorId' field
      comments: blog.comments.map(comment => ({
        ...comment.toObject(),
        userId: comment.userId._id,  // Include userId of the commenter
        userName: comment.userId.name // Add userName for the commenter
      }))
    }));

    res.status(200).json({ blogs: result });  // Trả về danh sách blog với thông tin tác giả và người bình luận
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Error fetching blogs' });
  }
};

const getAllBlogsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1; // Default page = 1
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10; // Default limit = 10
    const skip = (page - 1) * limit;
    const search = req.query.search ? req.query.search.trim() : ""; // Từ khóa tìm kiếm

    // Tạo điều kiện tìm kiếm
    const searchCondition = search
      ? { title: { $regex: search, $options: "i" } } // Tìm kiếm trong trường 'title'
      : {};

    // Đếm tổng số bài blog phù hợp
    const totalItems = await Blog.countDocuments(searchCondition);

    // Lấy danh sách bài blog phù hợp với tìm kiếm và phân trang
    const blogs = await Blog.find(searchCondition)
      .skip(skip)
      .limit(limit)
      .populate("authorId", "name email") // Hiển thị thêm thông tin tác giả (chỉ lấy 'name' và 'email')
      .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo mới nhất

    if (blogs.length === 0) {
      return res.status(404).json({ message: "No blogs found" });
    }

    const totalPages = Math.ceil(totalItems / limit);

    if (page > totalPages && totalPages > 0) {
      return res.status(400).json({ message: "Page number exceeds total pages" });
    }

    res.status(200).json({
      blogs,
      totalPages,
      totalItems,
      currentPage: page,
    });
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).json({ message: "An error occurred while fetching blogs." });
  }
};


const deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Kiểm tra quyền người dùng
    if (req.user._id.toString() !== blog.authorId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to delete this blog' });
    }

    // Sử dụng findByIdAndDelete thay vì remove
    await Blog.findByIdAndDelete(blogId);

    res.status(200).json({
      message: 'Blog deleted successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 

const searchBlog = async (req, res) => {
  try {
    const { query, status, authorId } = req.query;

    // Xây dựng điều kiện tìm kiếm
    let searchConditions = {};

    if (query) {
      searchConditions.title = { $regex: query, $options: 'i' }; // Tìm kiếm theo tiêu đề (không phân biệt chữ hoa hay chữ thường)
    }

    if (status) {
      searchConditions.status = status; // Tìm kiếm theo trạng thái (published, draft, etc.)
    }

    if (authorId) {
      searchConditions.authorId = authorId; // Tìm kiếm theo tác giả
    }

    // Tìm kiếm blog theo điều kiện đã xác định
    const blogs = await Blog.find(searchConditions);

    // Nếu không có bài viết nào phù hợp, trả về tất cả bài viết
    if (blogs.length === 0) {
      const allBlogs = await Blog.find(); // Lấy tất cả bài viết nếu không tìm thấy bài viết nào phù hợp
      return res.status(200).json({ blogs: allBlogs });
    }

    res.status(200).json({ blogs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 

module.exports = { addBlog, updateBlogUser, updateBlogAdmin, getAllBlogs, getAllBlogsAdmin, deleteBlog, searchBlog };
