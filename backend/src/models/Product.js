const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Producto', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sku: { type: DataTypes.STRING, allowNull: false, unique: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  categoria: { type: DataTypes.STRING, allowNull: true },
  precio_compra: { type: DataTypes.DECIMAL(12, 2), allowNull: true, defaultValue: 0 },
  precio_venta: { type: DataTypes.DECIMAL(12, 2), allowNull: true, defaultValue: 0 },
  stock_actual: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  stock_minimo: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5 },
  proveedor: { type: DataTypes.STRING, allowNull: true },
  fecha_creacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  fecha_ultima_actualizacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: 'productos',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_ultima_actualizacion'
});

module.exports = Product;
