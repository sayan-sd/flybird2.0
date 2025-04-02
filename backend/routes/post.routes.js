const express = require('express');
const router = express.Router();

// controllers & middlewares
const isAuthenticated = require('../middlewares/isAuthenticated');
const { addNewPost, getAllPosts, getUserPosts, likePost, dislikePost, addComment, get, getCommentsOfPosts, deletePost, bookmarkPost } = require('../controllers/post.controller');


router.post('/addpost', isAuthenticated, addNewPost);
router.get('/all', isAuthenticated, getAllPosts);
router.get('/userpost/all', isAuthenticated, getUserPosts);
router.get('/like/:id', isAuthenticated, likePost);
router.get('/dislike/:id', isAuthenticated, dislikePost);
router.post('/comment/:id', isAuthenticated, addComment);
router.get('/comment/:id/all', isAuthenticated, getCommentsOfPosts);
router.delete('/delete/:id', isAuthenticated, deletePost);
router.get('/bookmark/:id', isAuthenticated, bookmarkPost);

module.exports = router;