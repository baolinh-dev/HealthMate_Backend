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
      .exec();

    res.status(200).json({ blogs });  // Trả về danh sách blog với thông tin tác giả
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Error fetching blogs' });
  }
};

const getAllBlogsAdmin = async (req, res) => {
  try {
    const blogs = await Blog.find(); // Lấy tất cả các bài blog
    res.status(200).json({ blogs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
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
