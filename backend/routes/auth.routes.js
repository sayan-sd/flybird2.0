const express = require('express');
const router = express.Router();

// controllers
const { register, login, logout, sendOTP, verifyOTP } = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.post('/otp', sendOTP);
router.post('/verify', verifyOTP);

module.exports = router;