import React, { useEffect, useState } from 'react';
import api from '../services/api';
import MetricCard from '../components/MetricCard';
import DashboardCharts from '../components/DashboardCharts';
import { Package, DollarSign, AlertTriangle, TrendingUp, Search } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [topCategories, setTopCategories] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [sRes, topRes, distRes, alertRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/top-categories'),
          api.get('/dashboard/category-distribution'),
          api.get('/dashboard/reorder-alerts')
        ]);
        setSummary(sRes.data);
        setTopCategories(topRes.data);
        setDistribution(distRes.data);
        setAlerts(alertRes.data);
      } catch (error) {
        console.error("Error loading dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-8 page-enter">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-950">Dashboard</h1>
        <p className="text-zinc-500 font-medium">Panorama general del inventario y alertas críticas.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Total Productos" 
          value={isLoading ? "..." : summary?.totalProducts ?? 0} 
          helper="Registros únicos activos" 
          icon={Package}
        />
        <MetricCard 
          label="Valor Inventario" 
          value={isLoading ? "..." : `$${Number(summary?.inventoryValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          helper="Costo total estimado" 
          icon={DollarSign}
        />
        <MetricCard 
          label="Alertas Reorden" 
          value={isLoading ? "..." : summary?.reorderAlerts ?? 0} 
          helper="Stock bajo el mínimo" 
          icon={AlertTriangle}
        />
        <MetricCard 
          label="Mayor Valor" 
          value={isLoading ? "..." : summary?.topItem?.nombre ?? "N/A"} 
          helper={summary?.topItem ? `$${Number(summary.topItem.valor_inventario).toLocaleString('en-US', { minimumFractionDigits: 2 })} en inventario` : "Sin datos"} 
          icon={TrendingUp}
        />
      </div>

      {!isLoading && (
        <DashboardCharts topCategories={topCategories} distribution={distribution} />
      )}

      {/* Alertas Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden mt-6 flex flex-col hover:shadow-md transition-shadow">
        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
          <h2 className="text-lg font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Requiere Reorden Inmediato
          </h2>
          <p className="text-sm text-zinc-500 mt-1">Productos cuyo stock actual es inferior al mínimo establecido.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4 text-right">Stock Actual</th>
                <th className="px-6 py-4 text-right">Stock Mínimo</th>
              </tr>
            </thead>
            <tbody className="divide-y border-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-zinc-400">Cargando...</td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
                        <Search className="text-zinc-400" size={24} />
                      </div>
                      <p className="text-zinc-500 font-medium">No hay alertas de stock en este momento.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                alerts.map((row) => (
                  <tr key={row.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900">{row.sku}</td>
                    <td className="px-6 py-4 text-zinc-700">{row.nombre}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {row.categoria || 'Sin categoría'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-red-600">
                      {row.stock_actual}
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-500">
                      {row.stock_minimo}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}