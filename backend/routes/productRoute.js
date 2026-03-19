const express = require('express');
const { getProducts, getProductWithReviews, getProductCategories, getTrendingProducts } = require('../controllers/productController');

const router = express.Router();

router.get('/', getProducts);
router.get('/categories', getProductCategories);
router.get('/trending', getTrendingProducts);
router.get('/:id', getProductWithReviews);


module.exports = router;
