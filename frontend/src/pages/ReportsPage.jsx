import React, { useEffect, useState } from 'react';
import { FileText, Download, Loader2, ChevronDown } from 'lucide-react';
import api from '../services/api';

export default function ReportsPage() {
  const [categoria, setCategoria] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/products', { params: { page: 1, limit: 1000 } });
        const unique = [...new Set(res.data.data.map(p => p.categoria).filter(Boolean))];
        setCategories(unique);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const download = async (url, filename, isManagerial) => {
    isManagerial ? setLoading2(true) : setLoading1(true);
    try {
      const res = await api.get(url, { responseType: 'blob', params: categoria ? { categoria } : {} });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (e) {
      console.error(e);
      alert('Error descargando el reporte.');
    } finally {
      isManagerial ? setLoading2(false) : setLoading1(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 page-enter pb-20">
      <div className="flex flex-col gap-2 border-b border-zinc-200 pb-6 mt-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-100 rounded-lg">
            <FileText className="text-zinc-600" size={28} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-950">Reportes</h1>
        </div>
        <p className="text-zinc-500 font-medium ml-14">Documentos listos para impresión y análisis detallado.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Reporte Operacional */}
        <div className="group relative bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <FileText size={120} />
          </div>
          
          <div className="relative z-10 space-y-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-950">Inventario Operacional</h2>
              <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
                Listado detallado de existencias, precios y valorización. Ideal para toma de inventario físico.
              </p>
            </div>

            <div className="pt-4 space-y-2">
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                Filtrar por Categoría
              </label>
              <div className="relative">
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full appearance-none bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-xl focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 block p-3 pr-10 transition-colors cursor-pointer"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown size={16} className="text-zinc-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-6 border-t border-zinc-100">
            <button
              onClick={() => download('/reports/operational', 'reporte-operacional.pdf', false)}
              disabled={loading1}
              className="w-full flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl px-4 py-3.5 text-sm font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading1 ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              {loading1 ? 'Generando PDF...' : 'Generar PDF Operacional'}
            </button>
          </div>
        </div>

        {/* Reporte Gerencial */}
        <div className="group relative bg-zinc-950 border border-zinc-900 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between overflow-hidden">
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-zinc-800/50 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity" />
          
          <div className="relative z-10 space-y-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Resumen Gerencial</h2>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                Incluye los indicadores clave de rendimiento (KPIs), el estatus global del inventario y las alertas de quiebre de stock.
              </p>
            </div>
            <div className="pt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-zinc-300">Incluye analíticas visuales</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-6 border-t border-zinc-800">
            <button
              onClick={() => download('/reports/managerial', 'reporte-gerencial.pdf', true)}
              disabled={loading2}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-100 text-zinc-950 rounded-xl px-4 py-3.5 text-sm font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading2 ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              {loading2 ? 'Generando PDF...' : 'Generar PDF Gerencial'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}