const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Categoria', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  descripcion: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'categorias',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_ultima_actualizacion'
});

module.exports = Category;
