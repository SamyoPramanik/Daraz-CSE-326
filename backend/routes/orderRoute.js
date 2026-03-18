const express = require('express');


const { checkout , viewOrders } = require('../controllers/orderController');

const router = express.Router();

router.post('/checkout', checkout);
router.get('/', viewOrders);

module.exports = router;