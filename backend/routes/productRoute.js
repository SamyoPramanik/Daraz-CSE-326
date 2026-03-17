const express = require('express');
const { getProducts, getProductWithReviews } = require('../controllers/productController');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductWithReviews);

module.exports = router;
