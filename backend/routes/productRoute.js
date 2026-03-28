const express = require('express');
const {
	createProduct,
	updateProduct,
	deleteProduct,
	getProducts,
	getProductWithReviews,
	getProductCategories,
	getTrendingProducts,
} = require('../controllers/productController');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', getProducts);
router.post('/', adminMiddleware, createProduct);
router.put('/:id', adminMiddleware, updateProduct);
router.delete('/:id', adminMiddleware, deleteProduct);
router.get('/categories', getProductCategories);
router.get('/trending', getTrendingProducts);
router.get('/:id', getProductWithReviews);


module.exports = router;
