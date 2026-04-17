# Sistema de Gestión de Productos e Inventario (SGP)

Proyecto monolítico de dos capas: **Backend Node.js/Express + Sequelize + PostgreSQL** y **Frontend React + Vite + MUI + Recharts**. Incluye CRUD de productos, dashboard de KPIs, alertas de reorden y generación de reportes PDF con **jsreport**.

## Estructura
```text
/project-root
├── backend
└── frontend
```

## Arquitectura
El frontend consume una API REST del backend. El backend concentra la lógica de negocio, validación, acceso a datos y generación de reportes. PostgreSQL persiste el modelo de inventario. El dashboard se alimenta de endpoints agregados para evitar cálculo en el cliente.

## Flujo principal
1. Productos se crean/actualizan/eliminan desde React.
2. El backend valida y persiste con Sequelize.
3. Dashboard consulta KPIs y series para gráficas.
4. Reportes PDF se generan en backend usando HTML + jsreport.

## Requisitos
- Node.js 18+
- PostgreSQL 14+
- npm 9+

## Instalación

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Variables de entorno

### backend/.env
```env
PORT=4000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/sgp
CORS_ORIGIN=http://localhost:5173
```

## Endpoints principales
- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/dashboard/summary`
- `GET /api/dashboard/top-categories`
- `GET /api/dashboard/category-distribution`
- `GET /api/dashboard/reorder-alerts`
- `GET /api/reports/operational?categoria=...`
- `GET /api/reports/managerial`

## Mermaid: modelo de datos
```mermaid
erDiagram
  PRODUCTOS {
    INT id PK
    VARCHAR sku "UNIQUE NOT NULL"
    VARCHAR nombre "NOT NULL"
    TEXT descripcion
    VARCHAR categoria
    DECIMAL precio_compra
    DECIMAL precio_venta
    INT stock_actual "DEFAULT 0"
    INT stock_minimo "DEFAULT 5"
    VARCHAR proveedor
    TIMESTAMP fecha_creacion
    TIMESTAMP fecha_ultima_actualizacion
  }
```
