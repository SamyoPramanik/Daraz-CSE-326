const express = require('express');


const { registerUser , userLogin, adminLogin } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', userLogin);
router.post('/admin/login', adminLogin);

module.exports = router;