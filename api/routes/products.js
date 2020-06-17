const express = require('express');
const router = express.Router();

const checkAuth = require('../middleware/check-auth');
const productController = require('../controllers/products');

router.get('/', productController.products_get_all);

router.post('/', checkAuth, productController.upload.single('productImage'), productController.product_create_product);

router.get('/:productId', productController.product_get_one);

router.patch('/:productId', checkAuth, productController.product_update_product);

router.delete('/:productId', checkAuth, productController.product_delete_product);

module.exports = router;