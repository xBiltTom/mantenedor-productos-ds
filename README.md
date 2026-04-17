# Sistema de Gestión de Productos e Inventario (SGP)

Aplicación fullstack de dos capas: **Backend Node.js/Express + Sequelize + PostgreSQL** y **Frontend React + Vite + Tailwind CSS + Recharts**. Incluye CRUD de productos y categorías, dashboard de KPIs, alertas de reorden y generación de reportes PDF con **Puppeteer**.

## Estructura

```text
/
├── backend/          # API REST (Express + Sequelize)
│   └── src/
│       ├── app.js
│       ├── config/
│       ├── controllers/
│       │   ├── categoryController.js
│       │   ├── dashboardController.js
│       │   ├── productController.js
│       │   └── reportController.js
│       ├── models/
│       │   ├── Category.js
│       │   └── Product.js
│       ├── routes/
│       │   ├── categoryRoutes.js
│       │   ├── dashboardRoutes.js
│       │   ├── productRoutes.js
│       │   └── reportRoutes.js
│       └── services/
└── frontend/         # SPA React (Vite)
    └── src/
        ├── components/
        │   ├── CustomSelect.jsx
        │   ├── DashboardCharts.jsx
        │   ├── Layout.jsx
        │   ├── MetricCard.jsx
        │   └── Sidebar.jsx
        ├── pages/
        │   ├── CategoriesPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── ProductsPage.jsx
        │   └── ReportsPage.jsx
        └── services/
            └── api.js
```

## Arquitectura

El frontend es una SPA React que consume una API REST servida por el backend Express. El backend concentra la lógica de negocio, validación (express-validator), acceso a datos (Sequelize ORM) y generación de reportes PDF (Puppeteer). PostgreSQL persiste todos los datos. El dashboard se alimenta de endpoints agregados para evitar cálculos en el cliente.

## Flujo principal

1. Las **categorías** se crean y gestionan independientemente desde `/categorias`.
2. Los **productos** se crean/editan asignando una categoría de la lista dinámica obtenida de la API.
3. El backend valida y persiste con Sequelize; `sync({ alter: true })` mantiene el esquema al día.
4. El **dashboard** consulta KPIs y series para gráficos desde endpoints agregados.
5. Los **reportes PDF** se generan en el backend con Puppeteer y se sirven como `application/pdf`.

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- npm 9+

## Instalación

### Backend

```bash
cd backend
cp .env.example .env   # completar variables
npm install
npm run dev            # nodemon → http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # Vite → http://localhost:5173
```

## Variables de entorno

### `backend/.env`

```env
PORT=4000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/sgp
CORS_ORIGIN=http://localhost:5173
```

## Endpoints

### Categorías — `/api/categories`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/categories` | Listar todas las categorías |
| `GET` | `/api/categories/:id` | Obtener categoría por ID |
| `POST` | `/api/categories` | Crear categoría |
| `PUT` | `/api/categories/:id` | Actualizar categoría |
| `DELETE` | `/api/categories/:id` | Eliminar categoría |

### Productos — `/api/products`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/products` | Listar con paginación, búsqueda y filtro por categoría |
| `GET` | `/api/products/:id` | Obtener producto por ID |
| `POST` | `/api/products` | Crear producto |
| `PUT` | `/api/products/:id` | Actualizar producto |
| `DELETE` | `/api/products/:id` | Eliminar producto |

**Query params de listado:** `page`, `limit`, `search`, `categoria`

### Dashboard — `/api/dashboard`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/dashboard/summary` | KPIs generales |
| `GET` | `/api/dashboard/top-categories` | Top categorías por valor |
| `GET` | `/api/dashboard/category-distribution` | Distribución de stock por categoría |
| `GET` | `/api/dashboard/reorder-alerts` | Productos con stock bajo mínimo |

### Reportes — `/api/reports`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/reports/operational` | Reporte operacional PDF (`?categoria=`) |
| `GET` | `/api/reports/managerial` | Reporte gerencial PDF |

### Salud

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Estado del servidor |

## Modelo de datos

```mermaid
erDiagram
  CATEGORIAS {
    INT id PK
    VARCHAR nombre "UNIQUE NOT NULL"
    TEXT descripcion
    TIMESTAMP fecha_creacion
    TIMESTAMP fecha_ultima_actualizacion
  }

  PRODUCTOS {
    INT id PK
    VARCHAR sku "UNIQUE NOT NULL"
    VARCHAR nombre "NOT NULL"
    TEXT descripcion
    VARCHAR categoria
    DECIMAL precio_compra "DEFAULT 0"
    DECIMAL precio_venta "DEFAULT 0"
    INT stock_actual "DEFAULT 0"
    INT stock_minimo "DEFAULT 5"
    VARCHAR proveedor
    TIMESTAMP fecha_creacion
    TIMESTAMP fecha_ultima_actualizacion
  }

  CATEGORIAS ||--o{ PRODUCTOS : "nombre → categoria"
```

> **Nota:** La relación entre tablas es lógica (por nombre); `categoria` en `PRODUCTOS` almacena el nombre de la categoría como cadena de texto para simplificar las consultas del dashboard y los reportes.

