const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');


const { checkout , viewOrders } = require('../controllers/orderController');

const router = express.Router();

router.post('/checkout', requireAuth, checkout);
router.get('/me', requireAuth, viewOrders);
router.get('/', requireAuth, viewOrders);

module.exports = router;