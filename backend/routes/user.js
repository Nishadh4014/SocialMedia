const express = require("express");
const { register, followUser, unfollowUser, getPostOfFollowing, logout, updatePassword, updateProfile, myProfile, deleteProfile } = require("../controllers/user");
const { login } = require("../controllers/user");
const { isAuthenticated } = require("../middlewares/auth");
const router = express.Router();

// for sign-up
router.route("/register").post(register);

// for sign-in
router.route("/login").post(login);

// for following a user
router.route("/follow/:id").get(isAuthenticated,followUser);

// for unfollowing a user
router.route("/unfollow/:id").get(isAuthenticated,unfollowUser);

// for getting the posts of following users
router.route("/getPostsOfFollowings").get(isAuthenticated,getPostOfFollowing);

// for log-out
router.route("/logout").get(isAuthenticated,logout);

// for updateing a password
router.route("/update/password").put(isAuthenticated,updatePassword);

// for updating a profile
router.route("/update/profile").put(isAuthenticated,updateProfile);

// for displaying the profile
router.route("/me").get(isAuthenticated,myProfile);

// for deleting my profile
router.route("/deleteme").delete(isAuthenticated,deleteProfile);

module.exports = router;
