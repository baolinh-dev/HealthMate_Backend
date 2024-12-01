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


module.exports = { addBlog, updateBlogUser, updateBlogAdmin };
