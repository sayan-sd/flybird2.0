const express = require('express');
const router = express.Router();

// controllers
const { getProfile, editProfile, getMostFollowedUsers, followOrUnfollow } = require('../controllers/user.controller');
const isAuthenticated = require('../middlewares/isAuthenticated');



router.get('/profile/:id', isAuthenticated, getProfile);
router.post('/profile/edit', isAuthenticated, editProfile);
router.get('/suggested', isAuthenticated, getMostFollowedUsers);
router.post('/follow-or-unfollow/:id', isAuthenticated, followOrUnfollow);

module.exports = router;