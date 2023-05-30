const express = require("express");
const { createPost, likeAndUnlikePost, deletePost, updateCaption } = require("../controllers/post");
const { isAuthenticated } = require("../middlewares/auth");
const router = express.Router();

router.route("/post/upload").post(isAuthenticated ,createPost);
router.route("/post/:id").get(isAuthenticated, likeAndUnlikePost);
router.route("/post/:id").delete(isAuthenticated, deletePost);
router.route("/update/caption/:id").put(isAuthenticated, updateCaption)

module.exports = router;


