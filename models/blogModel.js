const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: String,
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Tham chiếu đến User
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  likes: [{ userId: mongoose.Schema.Types.ObjectId }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Tham chiếu đến User
    content: String,
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
