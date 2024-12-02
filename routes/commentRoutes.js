const express = require("express");
const { addComment, getComments } = require("../controllers/commentController");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// Thêm bình luận
router.post("/add", verifyToken, addComment);

// Lấy danh sách bình luận cho một blog
router.get("/:blogId", getComments);

module.exports = router;
