[Rol y Objetivo]
Actúa como un Desarrollador de Software Senior y Arquitecto de Soluciones Full-Stack. Tu tarea es diseñar, estructurar y generar el código completo y funcional (Backend y Frontend) para un "Sistema de Gestión de Productos e Inventario" (SGP). El objetivo es proporcionar a las PYMES una herramienta para controlar existencias, analizar KPIs de rendimiento y exportar reportes gerenciales en PDF.

[Contexto y Usuario Final]
- Usuario Objetivo: Pequeñas y Medianas Empresas (PYMES) que requieren una solución interna robusta pero de interfaz sencilla.
- Alcance: Aplicación Web Monolítica o de dos capas (Backend API + Frontend SPA).

[Requisitos Funcionales Detallados]

1. Módulo de Gestión de Productos (CRUD):
   - **Crear:** Formulario validado para añadir nuevos productos con los campos del modelo.
   - **Leer (Listado Principal):**
     - Vista de tabla paginada con todos los productos.
     - Barra de búsqueda global (filtro por nombre o SKU).
     - Filtro avanzado por categoría (Dropdown).
   - **Actualizar:** Al hacer clic en una fila o botón "Editar", cargar los datos existentes en un formulario para su modificación.
   - **Eliminar:** Botón de acción con modal de confirmación previo a la eliminación permanente.

2. Modelo de Datos del Producto (PostgreSQL):
   Debes utilizar exactamente los siguientes campos:
   - `id` (INT, PK, Autoincremental)
   - `sku` (VARCHAR, Único, No Nulo)
   - `nombre` (VARCHAR, No Nulo)
   - `descripcion` (TEXT)
   - `categoria` (VARCHAR)
   - `precio_compra` (DECIMAL)
   - `precio_venta` (DECIMAL)
   - `stock_actual` (INT, Default 0)
   - `stock_minimo` (INT, Default 5)
   - `proveedor` (VARCHAR)
   - `fecha_creacion` (TIMESTAMP)
   - `fecha_ultima_actualizacion` (TIMESTAMP)

3. Panel Principal (Dashboard de KPIs y Visualizaciones):
   - **Métricas Clave (KPIs):** Mostrar en tarjetas destacadas (Cards/Metrics):
     1. Total de productos únicos (COUNT(id)).
     2. Valor total del inventario (SUM(stock_actual * precio_compra)).
     3. Número de productos con `stock_actual < stock_minimo` (Alertas de Reorden).
     4. Producto con mayor valor en inventario (MAX(stock_actual * precio_compra)).
   - **Visualizaciones Interactivas (Recharts):**
     - Gráfico de Barras: "Top 10 Categorías con más productos en stock".
     - Gráfico Circular (Pastel): "Distribución del inventario por categoría" (basado en `stock_actual` o cantidad de ítems).
   - **Tabla de Alertas:** Listado dinámico de productos que requieren reorden (`stock_actual < stock_minimo`) visible en el dashboard.

4. Módulo de Reportes (Generación de PDF):
   - **Tecnología a utilizar:** `ActiveReportsJS` o `jsreport` integrado en el backend de Node.js.
   - **Reporte 1: Operacional (Listado de Inventario Actual)**
     - Contenido: Tabla detallada (SKU, Nombre, Stock, Valor Total en Inventario).
     - Funcionalidad: Debe permitir seleccionar una **categoría específica** desde un `<select>` en el frontend antes de descargar el PDF.
   - **Reporte 2: Gerencial (Análisis de Inventario y Bajo Stock)**
     - Contenido: Encabezado con los 4 KPIs del panel, incrustación de los gráficos (Barras y Pastel) y la tabla de productos a reordenar.
     - Estilo: Diseño profesional, membrete y colores corporativos claros.

[Pila Tecnológica (Stack Obligatorio)]
- **Base de Datos:** PostgreSQL.
- **Backend:** Node.js (Express.js).
- **ORM:** Sequelize (para definición de modelos y consultas seguras).
- **Frontend:** React (Vite o CRA).
- **Gráficos:** Recharts.
- **Reportes PDF:** Se está usando pupperpets
- **UI Framework (Sugerido):** Ant Design, Material UI o Tailwind CSS (Debe ser diseño limpio y profesional).

[Requisitos de UI/UX y Diseño]
- **Layout:** Estructura con **Menú Lateral Izquierdo** (Sidebar) fijo y área de contenido principal (Main) con padding adecuado.
- **Tema:** Tema **Claro (Light Mode)** por defecto con una paleta de colores profesional (ej. azul corporativo).
- **Widgets de Métricas:** Implementar componentes similares a `st.metric` de Streamlit (Tarjeta con label, valor grande y delta/info adicional).
- **Responsividad:** El diseño debe adaptarse a pantallas de escritorio estándar (mínimo 1280px) y ser fluido en tabletas.
- **Contenedores:** Usar tarjetas (`Card`) con bordes redondeados y sombras suaves para agrupar gráficos y tablas.

[Estructura de Archivos y Entregables]
Genera una estructura modular y profesional como la siguiente:
/project-root
├── /backend
│ ├── /src
│ │ ├── /models (Definiciones Sequelize)
│ │ ├── /controllers (Lógica de negocio)
│ │ ├── /routes (Endpoints API REST)
│ │ ├── /services (Generación de PDFs con jsreport/ActiveReports)
│ │ ├── /config (Conexión DB)
│ │ └── app.js
│ └── package.json
├── /frontend
│ ├── /src
│ │ ├── /components (Sidebar, ProductTable, MetricCard, Charts)
│ │ ├── /pages (DashboardPage, ProductsPage, ReportsPage)
│ │ ├── /services (Axios/Fetch API calls)
│ │ └── App.js
│ └── package.json
└── README.md

[Instrucciones de Calidad y Buenas Prácticas]
1. **Backend:** Implementa validación de datos de entrada (Express-Validator o similares). Manejo básico de errores con try/catch y respuestas HTTP adecuadas (400, 404, 500).
2. **Frontend:** Implementa carga diferida (Lazy Loading) de rutas si es posible.
3. **Seguridad Básica:** Sanitización de inputs contra SQL Injection (Sequelize lo maneja, pero sé explícito en el uso de parámetros). Protección básica de endpoints CORS.
4. **Código:** El código debe estar comentado en las partes lógicas complejas.

[Entregable Final Adicional]
Al finalizar la generación del código, proporciona una breve explicación de la **Arquitectura del Sistema** y genera el diagrama de **Modelo de Datos** utilizando sintaxis **Mermaid**.