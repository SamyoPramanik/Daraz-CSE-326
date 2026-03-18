
const express = require('express');


const { viewCart , addProduct , updateCart , removeFromCart } = require('../controllers/cartController');

const router = express.Router();

router.get('/viewCart', viewCart);
router.post('/addProduct', addProduct);
router.put('/:id', updateCart);
router.delete('/:id', removeFromCart);

module.exports = router;