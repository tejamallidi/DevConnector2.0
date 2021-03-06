const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const Post = require("../../models/Post");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

//@route  POST api/posts
//@desc   Create a post
//@access Private
router.post(
  "/",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route  GET api/posts
//@desc   Get all posts
//@access Private
router.get("/", auth, async (req, res) => {
  try {
    // Fetch the posts and sort them by date with the most recent one first
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

//@route  GET api/posts/:id
//@desc   Get a post by id
//@access Private
router.get("/:id", auth, async (req, res) => {
  try {
    // Fetch the post with post id
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    console.log(error.message);
    if (error.name == "CastError") {
      return res.status(400).json({
        message: "Post not found.",
      });
    }
    res.status(500).send("Server Error");
  }
});

//@route  DELETE api/posts/:id
//@desc   DELETE a post by id
//@access Private
router.delete("/:id", auth, async (req, res) => {
  try {
    // Find the post and delete it
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(400).json({
        message: "Post not found.",
      });
    }
    // Check if user owns the post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }
    await post.remove();
    res.json({ message: "Post deleted" });
  } catch (error) {
    console.log(error.message);
    if (error.name == "CastError") {
      return res.status(400).json({
        message: "Post not found.",
      });
    }
    res.status(500).send("Server Error");
  }
});

//@route  PATCH api/posts/like/:post_id
//@desc   Like a post by id
//@access Private
router.patch("/like/:post_id", auth, async (req, res) => {
  try {
    // Find the post by id
    const post = await Post.findById(req.params.post_id);

    // Check if the post has already been liked by the current user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res
        .status(400)
        .json({ message: "Post already liked by this user" });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.log(error.message);
    if (error.name == "CastError") {
      return res.status(400).json({
        message: "Post not found.",
      });
    }
    res.status(500).send("Server Error");
  }
});

//@route  PATCH api/posts/unlike/:post_id
//@desc   Unlike a post by id
//@access Private
router.patch("/unlike/:post_id", auth, async (req, res) => {
  try {
    // Find the post by id
    const post = await Post.findById(req.params.post_id);

    // Check if the post has already been liked by the current user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Post has not yet been liked by this user" });
    }
    // Get remove index
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.log(error.message);
    if (error.name == "CastError") {
      return res.status(400).json({
        message: "Post not found.",
      });
    }
    res.status(500).send("Server Error");
  }
});

//@route  POST api/posts/comment/:post_id
//@desc   Comment on a post
//@access Private
router.post(
  "/comment/:post_id",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.post_id);
      if (!post) {
        return res.status(400).json({
          message: "Post not found.",
        });
      }
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route  DELETE api/posts/comment/:post_id/:comment_id
//@desc   Delete a comment
//@access Private
router.delete("/comment/:post_id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    // Get the comment from the post
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    if (!comment) {
      return res.status(400).json({
        message: "Comment not found.",
      });
    }
    // Check if user is the owner of the comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }
    // Get remove index
    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(removeIndex, 1);
    await post.save();
    res.json(post.comments);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
