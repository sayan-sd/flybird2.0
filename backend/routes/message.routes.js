const express = require('express');
const router = express.Router();

// controllers & middlewares
const isAuthenticated = require('../middlewares/isAuthenticated');
const { sendMessage, getMessages } = require('../controllers/message.controller');


router.post('/send/:id', isAuthenticated, sendMessage);
router.get('/all/:id', isAuthenticated, getMessages);

module.exports = router;