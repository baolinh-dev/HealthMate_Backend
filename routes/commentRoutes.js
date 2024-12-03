const express = require("express");
const { addComment } = require("../controllers/commentController");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/add", verifyToken, addComment);

module.exports = router;
