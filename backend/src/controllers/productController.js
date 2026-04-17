const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const Product = require('../models/Product');

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

exports.listProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', categoria = '' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where = {};
    if (search) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (categoria) where.categoria = categoria;

    const { count, rows } = await Product.findAndCountAll({
      where,
      order: [['id', 'DESC']],
      limit: Number(limit),
      offset
    });

    res.json({
      data: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(count / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al listar productos', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validación fallida', errors: errors.array() });

    const payload = {
      sku: req.body.sku,
      nombre: req.body.nombre,
      descripcion: req.body.descripcion ?? null,
      categoria: req.body.categoria ?? null,
      precio_compra: toNumber(req.body.precio_compra) ?? 0,
      precio_venta: toNumber(req.body.precio_venta) ?? 0,
      stock_actual: toNumber(req.body.stock_actual) ?? 0,
      stock_minimo: toNumber(req.body.stock_minimo) ?? 5,
      proveedor: req.body.proveedor ?? null
    };

    const created = await Product.create(payload);
    res.status(201).json(created);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'El SKU ya existe' });
    }
    res.status(500).json({ message: 'Error al crear producto', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validación fallida', errors: errors.array() });

    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

    const payload = {
      sku: req.body.sku,
      nombre: req.body.nombre,
      descripcion: req.body.descripcion ?? null,
      categoria: req.body.categoria ?? null,
      precio_compra: toNumber(req.body.precio_compra) ?? 0,
      precio_venta: toNumber(req.body.precio_venta) ?? 0,
      stock_actual: toNumber(req.body.stock_actual) ?? 0,
      stock_minimo: toNumber(req.body.stock_minimo) ?? 5,
      proveedor: req.body.proveedor ?? null
    };

    await product.update(payload);
    res.json(product);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'El SKU ya existe' });
    }
    res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

    await product.destroy();
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
  }
};
