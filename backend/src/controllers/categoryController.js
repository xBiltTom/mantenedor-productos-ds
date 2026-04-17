const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const Category = require('../models/Category');

exports.listCategories = async (_req, res) => {
  try {
    const categories = await Category.findAll({ order: [['nombre', 'ASC']] });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error al listar categorías', error: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la categoría', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validación fallida', errors: errors.array() });

    const payload = {
      nombre: req.body.nombre.trim(),
      descripcion: req.body.descripcion?.trim() ?? null
    };

    const created = await Category.create(payload);
    res.status(201).json(created);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });
    }
    res.status(500).json({ message: 'Error al crear categoría', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validación fallida', errors: errors.array() });

    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Categoría no encontrada' });

    const payload = {
      nombre: req.body.nombre.trim(),
      descripcion: req.body.descripcion?.trim() ?? null
    };

    await category.update(payload);
    res.json(category);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });
    }
    res.status(500).json({ message: 'Error al actualizar categoría', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Categoría no encontrada' });

    await category.destroy();
    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar categoría', error: error.message });
  }
};
