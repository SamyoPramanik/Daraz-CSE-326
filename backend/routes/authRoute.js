const express = require('express');

const { requireAuth } = require('../middleware/authMiddleware');

const { registerUser , userLogin, adminLogin, logoutUser } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', userLogin);
router.post('/admin/login', adminLogin);
router.post('/logout', requireAuth, logoutUser);

module.exports = router;