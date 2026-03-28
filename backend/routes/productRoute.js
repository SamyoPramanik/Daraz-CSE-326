const express = require('express');
const {
	createProduct,
	getProducts,
	getProductWithReviews,
	getProductCategories,
	getTrendingProducts,
} = require('../controllers/productController');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', getProducts);
router.post('/', adminMiddleware, createProduct);
router.get('/categories', getProductCategories);
router.get('/trending', getTrendingProducts);
router.get('/:id', getProductWithReviews);


module.exports = router;
