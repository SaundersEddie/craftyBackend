const express = require('express');
const router = express.Router();
const { addProduct } = require('../controllers/productController');
const { searchProducts } = require('../controllers/productController');

router.get('/search', searchProducts);
router.post('/add', addProduct);

module.exports = router;
