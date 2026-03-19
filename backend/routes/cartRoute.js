
const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');


const { viewCart , addProduct , updateCart , removeFromCart } = require('../controllers/cartController');

const router = express.Router();

router.get('/', requireAuth, viewCart);
router.post('/', requireAuth, addProduct);
router.put('/:id', requireAuth, updateCart);
router.delete('/:id', requireAuth, removeFromCart);

module.exports = router;