import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import { Package, Plus, Search, Filter, Pencil, Trash2, ChevronLeft, ChevronRight, X, AlertTriangle, Check } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

// ─── Reusable input ──────────────────────────────────────────────────────────
function Field({ label, required, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A7A74' }}>
        {label}{required && <span style={{ color: '#D93636', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
      {error && <span style={{ fontSize: '11px', color: '#D93636', fontWeight: 500 }}>{error}</span>}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  background: '#FAFAF8',
  border: '1.5px solid #E5E5E2',
  color: '#0E0E0D',
  fontSize: '14px',
  borderRadius: '10px',
  padding: '10px 12px',
  outline: 'none',
  transition: 'border-color 0.15s ease, background 0.15s ease',
  fontFamily: 'inherit',
  appearance: 'none',
};

const inputFocusStyle = { borderColor: '#0E0E0D', background: '#fff' };
const inputDisabledStyle = { opacity: 0.5, cursor: 'not-allowed', background: '#F0F0EC' };

function Input({ disabled, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      disabled={disabled}
      style={{ ...inputStyle, ...(focused && !disabled ? inputFocusStyle : {}), ...(disabled ? inputDisabledStyle : {}) }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

// Select function replaced by CustomSelect component

// ─── Modal ───────────────────────────────────────────────────────────────────
function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxW = size === 'lg' ? '640px' : '520px';

  return createPortal(
    <div
      className="md:pl-[260px]"
      style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'rgba(14,14,13,0.6)', backdropFilter: 'blur(6px)', animation: 'overlayEnter 0.2s ease both' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 32px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)', width: '100%', maxWidth: maxW, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 40px)', animation: 'modalEnter 0.25s cubic-bezier(0.22,1,0.36,1) both' }}>
        {/* Header — never scrolls */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0F0EC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFAF8', borderRadius: '20px 20px 0 0', flexShrink: 0 }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.02em', color: '#0E0E0D' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#7A7A74', transition: 'background 0.15s ease, color 0.15s ease' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F0F0EC'; e.currentTarget.style.color = '#0E0E0D'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#7A7A74'; }}
          >
            <X size={18} />
          </button>
        </div>
        {/* Body — scrolls if content overflows */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>,
    document.body
  );
}

// ─── Number input with stepper ────────────────────────────────────────────────
function NumberInput({ value, onChange, min = 0, step = 1, prefix }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {prefix && (
        <span style={{ position: 'absolute', left: '12px', fontSize: '13px', color: '#7A7A74', fontWeight: 600, pointerEvents: 'none' }}>
          {prefix}
        </span>
      )}
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={onChange}
        style={{ ...inputStyle, ...(focused ? inputFocusStyle : {}), paddingLeft: prefix ? '28px' : '12px' }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

const categoriesList = ['Tecnología', 'Oficina', 'Hogar', 'Industrial'];

const emptyForm = { sku: '', nombre: '', categoria: '', precio_compra: '', precio_venta: '', stock_actual: 0, stock_minimo: 5 };

// ─── Product Form ─────────────────────────────────────────────────────────────
function ProductForm({ editing, onSave, onClose }) {
  const [formData, setFormData] = useState(editing ? { ...editing } : { ...emptyForm });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  const validate = () => {
    const e = {};
    if (!formData.sku.trim()) e.sku = 'El SKU es obligatorio';
    if (!formData.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (Number(formData.precio_venta) < Number(formData.precio_compra)) e.precio_venta = 'El precio de venta no puede ser menor al costo';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    const payload = {
      ...formData,
      precio_compra: Number(formData.precio_compra || 0),
      precio_venta: Number(formData.precio_venta || 0),
      stock_actual: Number(formData.stock_actual || 0),
      stock_minimo: Number(formData.stock_minimo || 5)
    };
    try {
      if (editing?.id) await api.put(`/products/${editing.id}`, payload);
      else await api.post('/products', payload);
      onSave();
    } catch (err) {
      console.error(err);
      setErrors({ general: err?.response?.data?.message || 'Error al guardar el producto.' });
    } finally {
      setSaving(false);
    }
  };

  const margin = formData.precio_compra && formData.precio_venta
    ? ((Number(formData.precio_venta) - Number(formData.precio_compra)) / Number(formData.precio_compra) * 100).toFixed(1)
    : null;
  const isLow = Number(formData.stock_actual) < Number(formData.stock_minimo);

  return (
    <form onSubmit={handleSubmit}>
      {/* Section: Identidad */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A8A8A0', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '16px', height: '1px', background: '#E5E5E2', display: 'inline-block' }} />
          Identidad del Producto
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <Field label="SKU" required error={errors.sku}>
            <Input
              type="text"
              value={formData.sku}
              onChange={e => set('sku', e.target.value)}
              disabled={!!editing}
              placeholder="Ej: TECH-001"
            />
          </Field>
          <Field label="Categoría">
            <CustomSelect 
              value={formData.categoria} 
              onChange={e => set('categoria', e.target.value)}
              options={[{ value: '', label: 'Sin categoría' }, ...categoriesList.map(c => ({ value: c, label: c }))]}
            />
          </Field>
        </div>
        <div style={{ marginTop: '14px' }}>
          <Field label="Nombre del Producto" required error={errors.nombre}>
            <Input
              type="text"
              value={formData.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Ej: Laptop Dell XPS 13"
            />
          </Field>
        </div>
      </div>

      {/* Section: Precios */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A8A8A0', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '16px', height: '1px', background: '#E5E5E2', display: 'inline-block' }} />
          Precios
          {margin !== null && (
            <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 700, color: Number(margin) >= 0 ? '#16A34A' : '#D93636', background: Number(margin) >= 0 ? '#DCFCE7' : '#FEE2E2', padding: '2px 8px', borderRadius: '5px' }}>
              Margen: {margin}%
            </span>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <Field label="Precio de Costo ($)">
            <NumberInput value={formData.precio_compra} onChange={e => set('precio_compra', e.target.value)} step="0.01" prefix="$" />
          </Field>
          <Field label="Precio de Venta ($)" error={errors.precio_venta}>
            <NumberInput value={formData.precio_venta} onChange={e => set('precio_venta', e.target.value)} step="0.01" prefix="$" />
          </Field>
        </div>
      </div>

      {/* Section: Stock */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A8A8A0', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '16px', height: '1px', background: '#E5E5E2', display: 'inline-block' }} />
          Control de Stock
          {isLow && formData.stock_actual !== '' && (
            <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 700, color: '#D93636', background: '#FEE2E2', padding: '2px 8px', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={10} /> Bajo mínimo
            </span>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <Field label="Stock Actual">
            <NumberInput value={formData.stock_actual} onChange={e => set('stock_actual', e.target.value)} />
          </Field>
          <Field label="Stock Mínimo (Alerta)">
            <NumberInput value={formData.stock_minimo} onChange={e => set('stock_minimo', e.target.value)} />
          </Field>
        </div>

        {/* Stock visual bar */}
        {(formData.stock_actual !== '' && formData.stock_minimo !== '') && (
          <div style={{ marginTop: '12px', padding: '12px 14px', background: '#FAFAF8', border: '1px solid #F0F0EC', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: '#7A7A74', fontWeight: 500 }}>Nivel de stock</span>
              <span style={{ fontSize: '11px', color: isLow ? '#D93636' : '#16A34A', fontWeight: 700 }}>
                {Number(formData.stock_actual)} / {Number(formData.stock_minimo)} mín.
              </span>
            </div>
            <div style={{ height: '6px', background: '#E5E5E2', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min((Number(formData.stock_actual) / Math.max(Number(formData.stock_minimo) * 2, 1)) * 100, 100)}%`,
                background: isLow ? '#D93636' : '#16A34A',
                borderRadius: '99px',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        )}
      </div>

      {errors.general && (
        <div style={{ padding: '12px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', color: '#D93636', fontWeight: 500 }}>
          {errors.general}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
        <button
          type="button"
          onClick={onClose}
          style={{ flex: 1, padding: '12px', background: '#F0F0EC', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#2A2A28', cursor: 'pointer', transition: 'background 0.15s ease', fontFamily: 'inherit' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#E5E5E2'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#F0F0EC'; }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          style={{ flex: 1, padding: '12px', background: saving ? '#6B6B66' : '#0E0E0D', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.15s ease', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#3D3D3A'; }}
          onMouseLeave={e => { if (!saving) e.currentTarget.style.background = '#0E0E0D'; }}
        >
          {saving ? (
            <><span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Guardando...</>
          ) : (
            <><Check size={16} /> {editing ? 'Guardar Cambios' : 'Crear Producto'}</>
          )}
        </button>
      </div>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');
  const [editing, setEditing] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const load = async (page = 1, limit = pagination.limit) => {
    setIsLoading(true);
    try {
      const res = await api.get('/products', { params: { page, limit, search, categoria } });
      setRows(res.data.data);
      setPagination(res.data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(1); }, [search, categoria]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/products/${confirmDelete.id}`);
      setConfirmDelete(null);
      await load(pagination.page, pagination.limit);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  // ── Styles ─────────────────────────────────────────────
  const tableCard = { background: '#fff', border: '1px solid #E5E5E2', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' };
  const thStyle = { padding: '12px 16px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7A7A74', background: '#FAFAF8', textAlign: 'left', borderBottom: '1px solid #E5E5E2' };
  const tdStyle = { padding: '14px 16px', fontSize: '13px', color: '#2A2A28', borderBottom: '1px solid #F0F0EC' };

  return (
    <>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .product-row:hover td { background: #FAFAF8 !important; }
        .action-btn { opacity: 0; transition: opacity 0.15s ease, background 0.15s ease; }
        .product-row:hover .action-btn { opacity: 1; }
      `}</style>
      <div className="page-enter" style={{ paddingBottom: '80px' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.03em', color: '#0E0E0D', lineHeight: 1.1 }}>
            Catálogo de Productos
          </h1>
          <p style={{ fontSize: '14px', color: '#7A7A74', fontWeight: 500, marginTop: '6px' }}>
            Gestión integral de inventario, precios y categorización.
          </p>
        </div>

        {/* Toolbar */}
        <div style={{ background: '#fff', border: '1px solid #E5E5E2', borderRadius: '16px', padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '180px', maxWidth: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A8A8A0', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Buscar SKU o nombre..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '38px' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#0E0E0D'; e.currentTarget.style.background = '#fff'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#E5E5E2'; e.currentTarget.style.background = '#FAFAF8'; }}
            />
          </div>

          <div style={{ width: '200px' }}>
            <CustomSelect
              icon={Filter}
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              options={[{ value: '', label: 'Todas las categorías' }, ...categoriesList.map(c => ({ value: c, label: c }))]}
            />
          </div>

          <button
            onClick={() => { setEditing(null); setOpenForm(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0E0E0D', color: '#fff', border: 'none', borderRadius: '12px', padding: '10px 18px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s ease', marginLeft: 'auto', whiteSpace: 'nowrap', fontFamily: 'inherit' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#3D3D3A'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#0E0E0D'; }}
          >
            <Plus size={16} />
            Nuevo Producto
          </button>
        </div>

        {/* Table */}
        <div style={tableCard}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>SKU</th>
                  <th style={thStyle}>Información</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Precio Venta</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Stock</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Estado</th>
                  <th style={{ ...thStyle, textAlign: 'right', width: '80px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" style={{ ...tdStyle, textAlign: 'center', padding: '48px', color: '#A8A8A0', fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <span style={{ width: '18px', height: '18px', border: '2px solid #E5E5E2', borderTopColor: '#0E0E0D', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                        Cargando catálogo...
                      </div>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ ...tdStyle, textAlign: 'center', padding: '64px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '52px', height: '52px', background: '#F0F0EC', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={24} style={{ color: '#A8A8A0' }} />
                        </div>
                        <p style={{ color: '#A8A8A0', fontWeight: 600, fontSize: '14px' }}>No se encontraron productos.</p>
                        <p style={{ color: '#C8C8C2', fontSize: '13px' }}>{search || categoria ? 'Intenta ajustar los filtros de búsqueda.' : 'Crea tu primer producto con el botón de arriba.'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const isLowStock = row.stock_actual < row.stock_minimo;
                    return (
                      <tr key={row.id} className="product-row" style={{ cursor: 'default' }}>
                        <td style={tdStyle}>
                          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', fontWeight: 600, color: '#7A7A74', background: '#F0F0EC', padding: '3px 8px', borderRadius: '5px' }}>
                            {row.sku}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 600, color: '#0E0E0D', fontSize: '14px' }}>{row.nombre}</div>
                          <div style={{ fontSize: '12px', color: '#A8A8A0', marginTop: '2px' }}>{row.categoria || 'Sin categoría'}</div>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: '#0E0E0D' }}>
                          ${Number(row.precio_venta).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                          <span style={{ fontWeight: 700, color: isLowStock ? '#D93636' : '#0E0E0D', fontSize: '15px' }}>
                            {row.stock_actual}
                          </span>
                          <span style={{ fontSize: '11px', color: '#A8A8A0', marginLeft: '4px' }}>/ {row.stock_minimo} mín</span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '6px',
                            fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                            background: isLowStock ? '#FEE2E2' : '#DCFCE7',
                            color: isLowStock ? '#D93636' : '#16A34A',
                          }}>
                            {isLowStock ? 'Alerta' : 'Óptimo'}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                            <button
                              className="action-btn"
                              onClick={() => { setEditing(row); setOpenForm(true); }}
                              title="Editar"
                              style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#7A7A74', fontFamily: 'inherit' }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#F0F0EC'; e.currentTarget.style.color = '#0E0E0D'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#7A7A74'; }}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              className="action-btn"
                              onClick={() => setConfirmDelete(row)}
                              title="Eliminar"
                              style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#7A7A74', fontFamily: 'inherit' }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#D93636'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#7A7A74'; }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ padding: '14px 20px', borderTop: '1px solid #F0F0EC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFAF8' }}>
            <span style={{ fontSize: '13px', color: '#7A7A74', fontWeight: 500 }}>
              Total: <strong style={{ color: '#0E0E0D' }}>{pagination.total}</strong> productos
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                disabled={pagination.page === 1}
                onClick={() => load(pagination.page - 1)}
                style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E5E5E2', borderRadius: '9px', background: '#fff', cursor: pagination.page === 1 ? 'not-allowed' : 'pointer', opacity: pagination.page === 1 ? 0.4 : 1, color: '#0E0E0D', transition: 'background 0.15s ease', fontFamily: 'inherit' }}
                onMouseEnter={e => { if (pagination.page !== 1) e.currentTarget.style.background = '#F0F0EC'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0E0E0D', padding: '0 8px' }}>
                Página {pagination.page}
              </span>
              <button
                disabled={rows.length < pagination.limit}
                onClick={() => load(pagination.page + 1)}
                style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E5E5E2', borderRadius: '9px', background: '#fff', cursor: rows.length < pagination.limit ? 'not-allowed' : 'pointer', opacity: rows.length < pagination.limit ? 0.4 : 1, color: '#0E0E0D', transition: 'background 0.15s ease', fontFamily: 'inherit' }}
                onMouseEnter={e => { if (rows.length >= pagination.limit) e.currentTarget.style.background = '#F0F0EC'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Delete Modal */}
        <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Confirmar Eliminación">
          <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
            <div style={{ width: '64px', height: '64px', background: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={28} style={{ color: '#D93636' }} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#0E0E0D', marginBottom: '8px' }}>¿Estás completamente seguro?</h4>
            <p style={{ fontSize: '14px', color: '#7A7A74', lineHeight: 1.6 }}>
              Vas a eliminar <strong style={{ color: '#0E0E0D' }}>{confirmDelete?.nombre}</strong>.
              <br />Esta acción es permanente y no se puede deshacer.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setConfirmDelete(null)}
              style={{ flex: 1, padding: '12px', background: '#F0F0EC', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#2A2A28', cursor: 'pointer', transition: 'background 0.15s ease', fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E5E5E2'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#F0F0EC'; }}
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{ flex: 1, padding: '12px', background: deleting ? '#6B6B66' : '#D93636', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#fff', cursor: deleting ? 'not-allowed' : 'pointer', transition: 'background 0.15s ease', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onMouseEnter={e => { if (!deleting) e.currentTarget.style.background = '#B91C1C'; }}
              onMouseLeave={e => { if (!deleting) e.currentTarget.style.background = '#D93636'; }}
            >
              {deleting
                ? <><span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Eliminando...</>
                : 'Sí, eliminar'
              }
            </button>
          </div>
        </Modal>

        {/* Product Form Modal */}
        <Modal isOpen={openForm} onClose={() => { setOpenForm(false); setEditing(null); }} title={editing ? 'Editar Producto' : 'Nuevo Producto'} size="lg">
          <ProductForm
            editing={editing}
            onSave={() => { setOpenForm(false); setEditing(null); load(pagination.page, pagination.limit); }}
            onClose={() => { setOpenForm(false); setEditing(null); }}
          />
        </Modal>
      </div>
    </>
  );
}