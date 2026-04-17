const Product = require('../models/Product');
const sequelize = require('../config/database');

exports.getSummary = async (_req, res) => {
  try {
    const totalProducts = await Product.count();

    const [[{ inv_value }]] = await sequelize.query(
      'SELECT COALESCE(SUM(stock_actual * precio_compra), 0) AS inv_value FROM productos'
    );
    const inventoryValue = Number(inv_value);

    const [[{ alert_count }]] = await sequelize.query(
      'SELECT COUNT(*) AS alert_count FROM productos WHERE stock_actual < stock_minimo'
    );
    const reorderAlerts = Number(alert_count);

    const [topRows] = await sequelize.query(
      'SELECT id, sku, nombre, (stock_actual * precio_compra) AS valor_inventario FROM productos ORDER BY valor_inventario DESC LIMIT 1'
    );
    const topItem = topRows.length > 0 ? topRows[0] : null;

    res.json({ totalProducts, inventoryValue, reorderAlerts, topItem });
  } catch (error) {
    console.error('Error getSummary:', error);
    res.status(500).json({ message: 'Error al calcular KPIs', error: error.message });
  }
};

exports.getTopCategories = async (_req, res) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT 
        COALESCE(categoria, 'Sin categoría') AS categoria,
        SUM(stock_actual) AS stock_total,
        COUNT(id) AS cantidad
       FROM productos
       GROUP BY categoria
       ORDER BY stock_total DESC
       LIMIT 10`
    );
    res.json(rows.map(r => ({
      categoria: r.categoria,
      stock_total: Number(r.stock_total),
      cantidad: Number(r.cantidad)
    })));
  } catch (error) {
    console.error('Error getTopCategories:', error);
    res.status(500).json({ message: 'Error al obtener categorías', error: error.message });
  }
};

exports.getCategoryDistribution = async (_req, res) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT 
        COALESCE(categoria, 'Sin categoría') AS categoria,
        SUM(stock_actual) AS stock_total
       FROM productos
       GROUP BY categoria
       ORDER BY stock_total DESC`
    );
    res.json(rows.map(r => ({
      categoria: r.categoria,
      stock_total: Number(r.stock_total)
    })));
  } catch (error) {
    console.error('Error getCategoryDistribution:', error);
    res.status(500).json({ message: 'Error al obtener distribución', error: error.message });
  }
};

exports.getReorderAlerts = async (_req, res) => {
  try {
    const [rows] = await sequelize.query(
      'SELECT * FROM productos WHERE stock_actual < stock_minimo ORDER BY stock_actual ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error getReorderAlerts:', error);
    res.status(500).json({ message: 'Error al obtener alertas', error: error.message });
  }
};
