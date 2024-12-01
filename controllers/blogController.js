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
    // Lọc chỉ lấy blog có trạng thái là published
    const blogs = await Blog.find({ status: 'published' });

    if (!blogs || blogs.length === 0) {
      return res.status(404).json({ message: 'No published blogs found.' });
    }

    res.status(200).json({
      message: 'Blogs retrieved successfully',
      blogs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
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

module.exports = { addBlog, updateBlogUser, updateBlogAdmin, getAllBlogs, getAllBlogsAdmin, deleteBlog };
