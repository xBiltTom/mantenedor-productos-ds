const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/productController');

const router = express.Router();

const validators = [
  body('sku').trim().notEmpty().withMessage('SKU es obligatorio'),
  body('nombre').trim().notEmpty().withMessage('Nombre es obligatorio'),
  body('precio_compra').optional().isNumeric().withMessage('Precio compra debe ser numérico'),
  body('precio_venta').optional().isNumeric().withMessage('Precio venta debe ser numérico'),
  body('stock_actual').optional().isInt({ min: 0 }).withMessage('Stock actual debe ser entero >= 0'),
  body('stock_minimo').optional().isInt({ min: 0 }).withMessage('Stock mínimo debe ser entero >= 0')
];

router.get('/', controller.listProducts);
router.get('/:id', controller.getProductById);
router.post('/', validators, controller.createProduct);
router.put('/:id', validators, controller.updateProduct);
router.delete('/:id', controller.deleteProduct);

module.exports = router;
