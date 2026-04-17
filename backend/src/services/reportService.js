const puppeteer = require('puppeteer');
const Product = require('../models/Product');

// ─── Core PDF generator ────────────────────────────────────────────────────
async function generatePDF(html) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '18mm', right: '18mm', bottom: '18mm', left: '18mm' }
    });
    // Puppeteer v22+ returns a Uint8Array; convert to Buffer for correct binary transmission
    return Buffer.isBuffer(pdf) ? pdf : Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

// ─── Shared CSS ─────────────────────────────────────────────────────────────
const baseCss = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    color: #0E0E0D;
    background: #fff;
    font-size: 12px;
    line-height: 1.5;
  }
  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    border-bottom: 2px solid #0E0E0D;
    padding-bottom: 16px;
    margin-bottom: 28px;
  }
  .header h1 {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.5px;
    line-height: 1.1;
    color: #0E0E0D;
  }
  .header .subtitle {
    font-size: 11px;
    color: #7A7A74;
    margin-top: 4px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 500;
  }
  .header-badge {
    background: #0E0E0D;
    color: #fff;
    font-size: 10px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    white-space: nowrap;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
  }
  thead tr {
    border-bottom: 2px solid #0E0E0D;
  }
  th {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #7A7A74;
    padding: 8px 10px;
    text-align: left;
  }
  td {
    padding: 10px;
    border-bottom: 1px solid #E5E5E2;
    color: #2A2A28;
  }
  tbody tr:last-child td { border-bottom: none; }
  tbody tr:nth-child(even) td { background: #FAFAF8; }
  .text-right { text-align: right; }
  .text-center { text-align: center; }
  .mono { font-family: 'Courier New', monospace; font-size: 10px; color: #7A7A74; font-weight: 600; }
  .bold { font-weight: 700; }
  .red { color: #D93636; font-weight: 700; }
  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .badge-alert { background: #FEE2E2; color: #D93636; }
  .badge-ok { background: #DCFCE7; color: #16A34A; }
  .footer {
    margin-top: 32px;
    padding-top: 12px;
    border-top: 1px solid #E5E5E2;
    font-size: 10px;
    color: #A8A8A0;
    display: flex;
    justify-content: space-between;
  }
`;

// ─── Operational Report ─────────────────────────────────────────────────────
exports.generateOperationalReport = async (categoria) => {
  const where = categoria ? { categoria } : {};
  const products = await Product.findAll({ where, order: [['sku', 'ASC']], raw: true });

  const totalValue = products.reduce((acc, p) => acc + (p.stock_actual * parseFloat(p.precio_compra || 0)), 0);
  const lowCount = products.filter(p => p.stock_actual < p.stock_minimo).length;

  const rowsHtml = products.length > 0
    ? products.map(p => {
        const valorTotal = p.stock_actual * parseFloat(p.precio_compra || 0);
        const isLow = p.stock_actual < p.stock_minimo;
        return `<tr>
          <td class="mono">${p.sku}</td>
          <td class="bold">${p.nombre}</td>
          <td>${p.categoria || '—'}</td>
          <td class="text-right">$${parseFloat(p.precio_compra || 0).toFixed(2)}</td>
          <td class="text-right">$${parseFloat(p.precio_venta || 0).toFixed(2)}</td>
          <td class="text-right bold">${p.stock_actual}</td>
          <td class="text-right">${p.stock_minimo}</td>
          <td class="text-right"><span class="badge ${isLow ? 'badge-alert' : 'badge-ok'}">${isLow ? 'Bajo' : 'OK'}</span></td>
          <td class="text-right bold">$${valorTotal.toFixed(2)}</td>
        </tr>`;
      }).join('')
    : '<tr><td colspan="9" class="text-center" style="padding:24px;color:#7A7A74;">No hay productos registrados.</td></tr>';

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <style>
    ${baseCss}
    .summary-row {
      display: flex;
      gap: 16px;
      margin-bottom: 28px;
    }
    .summary-card {
      flex: 1;
      border: 1px solid #E5E5E2;
      border-radius: 8px;
      padding: 14px 16px;
      background: #FAFAF8;
    }
    .summary-card .label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #7A7A74;
      margin-bottom: 6px;
    }
    .summary-card .value {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: #0E0E0D;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Reporte Operacional<br>de Inventario</h1>
      <div class="subtitle">Categoría: ${categoria || 'Todas las categorías'} &nbsp;·&nbsp; ${new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
    </div>
    <div class="header-badge">SGP &middot; Inventario</div>
  </div>

  <div class="summary-row">
    <div class="summary-card">
      <div class="label">Total Productos</div>
      <div class="value">${products.length}</div>
    </div>
    <div class="summary-card">
      <div class="label">Valor Total Inventario</div>
      <div class="value">$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
    </div>
    <div class="summary-card">
      <div class="label">Alertas Bajo Stock</div>
      <div class="value" style="color: ${lowCount > 0 ? '#D93636' : '#16A34A'}">${lowCount}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>SKU</th>
        <th>Nombre</th>
        <th>Categoría</th>
        <th class="text-right">P. Compra</th>
        <th class="text-right">P. Venta</th>
        <th class="text-right">Stock</th>
        <th class="text-right">Mín.</th>
        <th class="text-right">Estado</th>
        <th class="text-right">Valor Total</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
    <tfoot>
      <tr>
        <td colspan="8" class="text-right bold" style="padding-top:14px;border-top:2px solid #0E0E0D;border-bottom:none;font-size:11px;">VALOR TOTAL INVENTARIO</td>
        <td class="text-right bold" style="padding-top:14px;border-top:2px solid #0E0E0D;border-bottom:none;font-size:14px;">$${totalValue.toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">
    <span>Sistema de Gestión de Productos &middot; SGP</span>
    <span>Generado el ${new Date().toLocaleString('es-CL')}</span>
  </div>
</body>
</html>`;

  return generatePDF(html);
};

// ─── Managerial Report ──────────────────────────────────────────────────────
exports.generateManagerialReport = async () => {
  const allProducts = await Product.findAll({ raw: true });

  const totalProducts = allProducts.length;
  const inventoryValue = allProducts.reduce((acc, p) => acc + (p.stock_actual * parseFloat(p.precio_compra || 0)), 0);
  const lowStockItems = allProducts
    .filter(p => p.stock_actual < p.stock_minimo)
    .sort((a, b) => a.stock_actual - b.stock_actual);

  // Category distribution
  const catMap = {};
  allProducts.forEach(p => {
    const cat = p.categoria || 'Sin categoría';
    if (!catMap[cat]) catMap[cat] = { count: 0, stock: 0, value: 0 };
    catMap[cat].count++;
    catMap[cat].stock += p.stock_actual;
    catMap[cat].value += p.stock_actual * parseFloat(p.precio_compra || 0);
  });
  const categories = Object.entries(catMap).sort((a, b) => b[1].value - a[1].value);

  const catRowsHtml = categories.length > 0
    ? categories.map(([cat, data]) => `<tr>
        <td class="bold">${cat}</td>
        <td class="text-right">${data.count}</td>
        <td class="text-right">${data.stock}</td>
        <td class="text-right bold">$${data.value.toFixed(2)}</td>
      </tr>`).join('')
    : '<tr><td colspan="4" class="text-center" style="padding:20px;color:#7A7A74;">Sin datos de categorías.</td></tr>';

  const alertRowsHtml = lowStockItems.length > 0
    ? lowStockItems.map(p => `<tr>
        <td class="mono">${p.sku}</td>
        <td class="bold">${p.nombre}</td>
        <td>${p.categoria || '—'}</td>
        <td class="text-right red bold">${p.stock_actual}</td>
        <td class="text-right">${p.stock_minimo}</td>
        <td class="text-right">$${parseFloat(p.precio_compra || 0).toFixed(2)}</td>
      </tr>`).join('')
    : '<tr><td colspan="6" class="text-center" style="padding:20px;color:#16A34A;font-weight:600;">Sin alertas de bajo stock.</td></tr>';

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <style>
    ${baseCss}
    .kpi-grid {
      display: flex;
      gap: 14px;
      margin-bottom: 32px;
    }
    .kpi-card {
      flex: 1;
      border: 1px solid #E5E5E2;
      border-radius: 10px;
      padding: 16px;
      background: #FAFAF8;
    }
    .kpi-card.dark {
      background: #0E0E0D;
      border-color: #0E0E0D;
    }
    .kpi-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #7A7A74;
      margin-bottom: 8px;
    }
    .kpi-card.dark .kpi-label { color: #A8A8A0; }
    .kpi-value {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -1px;
      color: #0E0E0D;
    }
    .kpi-card.dark .kpi-value { color: #fff; }
    .kpi-alert { color: #D93636; }
    .section-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #0E0E0D;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #E5E5E2;
    }
    .section { margin-bottom: 32px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Reporte Gerencial<br>de Inventario</h1>
      <div class="subtitle">Analisis ejecutivo de KPIs &amp; stock critico &nbsp;·&nbsp; ${new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
    </div>
    <div class="header-badge">SGP &middot; Gerencial</div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card dark">
      <div class="kpi-label">Total Productos</div>
      <div class="kpi-value">${totalProducts}</div>
    </div>
    <div class="kpi-card dark">
      <div class="kpi-label">Valor de Inventario</div>
      <div class="kpi-value">$${inventoryValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Alertas Reorden</div>
      <div class="kpi-value ${lowStockItems.length > 0 ? 'kpi-alert' : ''}">${lowStockItems.length}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Categorias</div>
      <div class="kpi-value">${categories.length}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Distribucion por Categoria</div>
    <table>
      <thead>
        <tr>
          <th>Categoria</th>
          <th class="text-right">Productos</th>
          <th class="text-right">Stock Total</th>
          <th class="text-right">Valor en Inventario</th>
        </tr>
      </thead>
      <tbody>${catRowsHtml}</tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title" style="color: #D93636;">Productos con Stock Critico</div>
    <table>
      <thead>
        <tr>
          <th>SKU</th>
          <th>Producto</th>
          <th>Categoria</th>
          <th class="text-right">Stock Actual</th>
          <th class="text-right">Stock Minimo</th>
          <th class="text-right">Precio Compra</th>
        </tr>
      </thead>
      <tbody>${alertRowsHtml}</tbody>
    </table>
  </div>

  <div class="footer">
    <span>Sistema de Gestion de Productos &middot; SGP - Reporte Confidencial</span>
    <span>Generado el ${new Date().toLocaleString('es-CL')}</span>
  </div>
</body>
</html>`;

  return generatePDF(html);
};