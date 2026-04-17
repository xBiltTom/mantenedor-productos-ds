const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/categoryController');

const router = express.Router();

const validators = [
  body('nombre').trim().notEmpty().withMessage('El nombre de la categoría es obligatorio'),
  body('descripcion').optional({ nullable: true }).isString()
];

router.get('/', controller.listCategories);
router.get('/:id', controller.getCategoryById);
router.post('/', validators, controller.createCategory);
router.put('/:id', validators, controller.updateCategory);
router.delete('/:id', controller.deleteCategory);

module.exports = router;
