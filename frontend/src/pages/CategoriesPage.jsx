import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import {
  Tags, Plus, Pencil, Trash2, X, AlertTriangle, Check, Layers, Hash
} from 'lucide-react';

// ─── Shared input styles (matching ProductsPage design system) ───────────────
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
  boxSizing: 'border-box',
};

function Field({ label, required, error, children, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A7A74' }}>
        {label}{required && <span style={{ color: '#D93636', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
      {hint && !error && <span style={{ fontSize: '11px', color: '#A8A8A0', fontWeight: 500 }}>{hint}</span>}
      {error && <span style={{ fontSize: '11px', color: '#D93636', fontWeight: 500 }}>{error}</span>}
    </div>
  );
}

function Input({ ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{
        ...inputStyle,
        ...(focused ? { borderColor: '#0E0E0D', background: '#fff' } : {})
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function Textarea({ ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      {...props}
      rows={3}
      style={{
        ...inputStyle,
        resize: 'vertical',
        minHeight: '80px',
        ...(focused ? { borderColor: '#0E0E0D', background: '#fff' } : {})
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────
function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="md:pl-[260px]"
      style={{
        position: 'fixed', inset: 0, zIndex: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        background: 'rgba(14,14,13,0.6)',
        backdropFilter: 'blur(6px)',
        animation: 'overlayEnter 0.2s ease both'
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#fff', borderRadius: '20px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)',
        width: '100%', maxWidth: '480px',
        display: 'flex', flexDirection: 'column',
        maxHeight: 'calc(100vh - 40px)',
        animation: 'modalEnter 0.25s cubic-bezier(0.22,1,0.36,1) both'
      }}>
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #F0F0EC',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#FAFAF8', borderRadius: '20px 20px 0 0', flexShrink: 0
        }}>
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
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>,
    document.body
  );
}

// ─── Category Form ────────────────────────────────────────────────────────────
const emptyForm = { nombre: '', descripcion: '' };

function CategoryForm({ editing, onSave, onClose }) {
  const [formData, setFormData] = useState(editing ? { nombre: editing.nombre, descripcion: editing.descripcion || '' } : { ...emptyForm });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  const validate = () => {
    const e = {};
    if (!formData.nombre.trim()) e.nombre = 'El nombre de la categoría es obligatorio';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    const payload = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim() || null
    };
    try {
      if (editing?.id) await api.put(`/categories/${editing.id}`, payload);
      else await api.post('/categories', payload);
      onSave();
    } catch (err) {
      console.error(err);
      setErrors({ general: err?.response?.data?.message || 'Error al guardar la categoría.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: '#A8A8A0', marginBottom: '14px',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <span style={{ width: '16px', height: '1px', background: '#E5E5E2', display: 'inline-block' }} />
          Información de la Categoría
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Field label="Nombre" required error={errors.nombre} hint="Visible en el selector de productos">
            <Input
              type="text"
              value={formData.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Ej: Tecnología, Hogar, Oficina..."
              autoFocus
            />
          </Field>
          <Field label="Descripción" hint="Opcional — descripción interna de la categoría">
            <Textarea
              value={formData.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              placeholder="Ej: Productos electrónicos y accesorios tecnológicos..."
            />
          </Field>
        </div>
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
          {saving
            ? <><span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Guardando...</>
            : <><Check size={16} /> {editing ? 'Guardar Cambios' : 'Crear Categoría'}</>
          }
        </button>
      </div>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
// Palette accent for categories — warm amber to differentiate from products
const ACCENT = '#C2632D'; // terracotta-amber

export default function CategoriesPage() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/categories');
      setRows(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/categories/${confirmDelete.id}`);
      setConfirmDelete(null);
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  // Colour palette — cycle through a curated set of warm/cool tones per card
  const CHIP_COLORS = [
    { bg: '#FEF3E2', color: '#92400E' },
    { bg: '#E0F2FE', color: '#075985' },
    { bg: '#F0FDF4', color: '#166534' },
    { bg: '#FDF2F8', color: '#9D174D' },
    { bg: '#EFF6FF', color: '#1E40AF' },
    { bg: '#FFF7ED', color: '#C2410C' },
  ];

  const tableCard = {
    background: '#fff', border: '1px solid #E5E5E2',
    borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden'
  };
  const thStyle = {
    padding: '12px 20px', fontSize: '10px', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7A7A74',
    background: '#FAFAF8', textAlign: 'left', borderBottom: '1px solid #E5E5E2'
  };
  const tdStyle = {
    padding: '16px 20px', fontSize: '13px', color: '#2A2A28',
    borderBottom: '1px solid #F0F0EC'
  };

  return (
    <>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes overlayEnter { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalEnter { from { opacity: 0; transform: scale(0.95) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .cat-row:hover td { background: #FAFAF8 !important; }
        .cat-action-btn { opacity: 0; transition: opacity 0.15s ease, background 0.15s ease; }
        .cat-row:hover .cat-action-btn { opacity: 1; }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cat-card-enter {
          animation: slideIn 0.35s cubic-bezier(0.22,1,0.36,1) both;
        }
      `}</style>

      <div className="page-enter" style={{ paddingBottom: '80px' }}>
        {/* ── Header ── */}
        <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.03em', color: '#0E0E0D', lineHeight: 1.1 }}>
              Categorías
            </h1>
            <p style={{ fontSize: '14px', color: '#7A7A74', fontWeight: 500, marginTop: '6px' }}>
              Define las categorías disponibles para clasificar tus productos.
            </p>
          </div>
          <button
            id="btn-nueva-categoria"
            onClick={() => { setEditing(null); setOpenForm(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0E0E0D', color: '#fff', border: 'none', borderRadius: '12px', padding: '11px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s ease', whiteSpace: 'nowrap', fontFamily: 'inherit', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = '#3D3D3A'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#0E0E0D'; }}
          >
            <Plus size={16} /> Nueva Categoría
          </button>
        </div>

        {/* ── Stats strip ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          {[
            { label: 'Total de Categorías', value: rows.length, icon: Layers, accent: '#0E0E0D' },
            { label: 'Con Descripción', value: rows.filter(r => r.descripcion).length, icon: Hash, accent: '#2563EB' },
          ].map(({ label, value, icon: Icon, accent }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #E5E5E2', borderRadius: '14px', padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '38px', height: '38px', background: '#F8F8F6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={17} color={accent} />
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#0E0E0D', lineHeight: 1.1, letterSpacing: '-0.02em' }}>{isLoading ? '—' : value}</div>
                <div style={{ fontSize: '11px', color: '#A8A8A0', fontWeight: 500, marginTop: '2px' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Table ── */}
        <div style={tableCard}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: '60px' }}>#</th>
                  <th style={thStyle}>Nombre</th>
                  <th style={thStyle}>Descripción</th>
                  <th style={{ ...thStyle, textAlign: 'right', width: '100px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="4" style={{ ...tdStyle, textAlign: 'center', padding: '56px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#A8A8A0', fontWeight: 500 }}>
                        <span style={{ width: '18px', height: '18px', border: '2px solid #E5E5E2', borderTopColor: '#0E0E0D', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                        Cargando categorías...
                      </div>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ ...tdStyle, textAlign: 'center', padding: '72px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '56px', height: '56px', background: '#F0F0EC', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Tags size={26} style={{ color: '#A8A8A0' }} />
                        </div>
                        <p style={{ color: '#A8A8A0', fontWeight: 600, fontSize: '14px', margin: 0 }}>Sin categorías aún</p>
                        <p style={{ color: '#C8C8C2', fontSize: '13px', margin: 0 }}>Crea tu primera categoría con el botón superior.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => {
                    const chip = CHIP_COLORS[idx % CHIP_COLORS.length];
                    return (
                      <tr key={row.id} className="cat-row" style={{ cursor: 'default' }}>
                        <td style={{ ...tdStyle, width: '60px' }}>
                          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', fontWeight: 600, color: '#A8A8A0', background: '#F0F0EC', padding: '2px 7px', borderRadius: '5px' }}>
                            {row.id}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            background: chip.bg, color: chip.color,
                            padding: '4px 12px', borderRadius: '8px',
                            fontSize: '13px', fontWeight: 700, letterSpacing: '-0.01em'
                          }}>
                            <Tags size={12} />
                            {row.nombre}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: row.descripcion ? '#2A2A28' : '#C8C8C2', fontStyle: row.descripcion ? 'normal' : 'italic', fontSize: '13px', maxWidth: '360px' }}>
                          {row.descripcion || 'Sin descripción'}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                            <button
                              id={`btn-editar-cat-${row.id}`}
                              className="cat-action-btn"
                              onClick={() => { setEditing(row); setOpenForm(true); }}
                              title="Editar categoría"
                              style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#7A7A74', fontFamily: 'inherit' }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#F0F0EC'; e.currentTarget.style.color = '#0E0E0D'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#7A7A74'; }}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              id={`btn-eliminar-cat-${row.id}`}
                              className="cat-action-btn"
                              onClick={() => setConfirmDelete(row)}
                              title="Eliminar categoría"
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

          {/* Footer count */}
          {!isLoading && rows.length > 0 && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid #F0F0EC', background: '#FAFAF8', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#7A7A74', fontWeight: 500 }}>
                Total: <strong style={{ color: '#0E0E0D' }}>{rows.length}</strong> {rows.length === 1 ? 'categoría' : 'categorías'}
              </span>
            </div>
          )}
        </div>

        {/* ── Delete Confirm Modal ── */}
        <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Eliminar Categoría">
          <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
            <div style={{ width: '64px', height: '64px', background: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={28} style={{ color: '#D93636' }} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#0E0E0D', marginBottom: '8px' }}>¿Estás completamente seguro?</h4>
            <p style={{ fontSize: '14px', color: '#7A7A74', lineHeight: 1.6 }}>
              Vas a eliminar la categoría <strong style={{ color: '#0E0E0D' }}>«{confirmDelete?.nombre}»</strong>.
              <br />Los productos que la usen quedarán sin categoría asignada.
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
              id="btn-confirmar-eliminar-cat"
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

        {/* ── Category Form Modal ── */}
        <Modal
          isOpen={openForm}
          onClose={() => { setOpenForm(false); setEditing(null); }}
          title={editing ? 'Editar Categoría' : 'Nueva Categoría'}
        >
          <CategoryForm
            editing={editing}
            onSave={() => { setOpenForm(false); setEditing(null); load(); }}
            onClose={() => { setOpenForm(false); setEditing(null); }}
          />
        </Modal>
      </div>
    </>
  );
}
