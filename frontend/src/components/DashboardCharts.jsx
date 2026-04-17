import React, { useState } from 'react';
import {
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Sector
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

// Refined monochromatic palette — editorial/industrial feel
const PALETTE = ['#0E0E0D', '#3D3D3A', '#6B6B66', '#9A9A94', '#C8C8C2', '#E5E5E0'];

// Custom bar tooltip
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0E0E0D',
      color: '#fff',
      padding: '10px 14px',
      borderRadius: '10px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
      minWidth: '140px',
    }}>
      <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#A8A8A0', marginBottom: '6px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff', flexShrink: 0 }} />
        <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px' }}>{payload[0].value}</span>
        <span style={{ fontSize: '10px', color: '#A8A8A0', marginTop: '2px' }}>uds.</span>
      </div>
    </div>
  );
};

// Active pie shape with a subtle inner ring
const ActivePieShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 4} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 8} outerRadius={innerRadius - 5} startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.4} />
      <text x={cx} y={cy - 12} textAnchor="middle" style={{ fontFamily: 'DM Sans, Helvetica, sans-serif', fontSize: '14px', fontWeight: 700, fill: '#0E0E0D' }}>
        {payload.categoria}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontFamily: 'DM Sans, Helvetica, sans-serif', fontSize: '22px', fontWeight: 700, fill: '#0E0E0D', letterSpacing: '-1px' }}>
        {payload.stock_total}
      </text>
      <text x={cx} y={cy + 28} textAnchor="middle" style={{ fontFamily: 'DM Sans, Helvetica, sans-serif', fontSize: '11px', fill: '#7A7A74', fontWeight: 500 }}>
        {(percent * 100).toFixed(1)}% del total
      </text>
    </g>
  );
};

const cardStyle = {
  background: '#fff',
  border: '1px solid #E5E5E2',
  borderRadius: '16px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  transition: 'box-shadow 0.2s ease',
};

const cardHeaderStyle = {
  padding: '20px 24px',
  borderBottom: '1px solid #F0F0EC',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  background: '#FAFAF8',
};

export default function DashboardCharts({ topCategories, distribution }) {
  const [activePieIndex, setActivePieIndex] = useState(0);

  const hasBarData = topCategories && topCategories.length > 0;
  const hasPieData = distribution && distribution.length > 0;

  const CustomBarShape = (props) => {
    const { x, y, width, height, index } = props;
    const opacity = 1 - (index / (topCategories.length || 1)) * 0.55;
    return (
      <rect
        x={x + 2}
        y={y}
        width={Math.max(width - 4, 2)}
        height={height}
        rx={5}
        ry={5}
        fill={`rgba(14,14,13,${opacity})`}
      />
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '8px' }}>

      {/* Bar Chart */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.02em', color: '#0E0E0D' }}>Top Categorías</div>
            <div style={{ fontSize: '12px', color: '#7A7A74', marginTop: '3px' }}>Stock total por segmento</div>
          </div>
          <div style={{ padding: '8px', background: '#fff', border: '1px solid #E5E5E2', borderRadius: '10px', color: '#7A7A74', display: 'flex', alignItems: 'center' }}>
            <BarChart3 size={18} />
          </div>
        </div>

        <div style={{ padding: '20px', flex: 1 }}>
          {!hasBarData ? (
            <EmptyState icon={TrendingUp} message="Agrega productos para ver las categorías con más stock." />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCategories} margin={{ top: 10, right: 4, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0EC" />
                <XAxis
                  dataKey="categoria"
                  tick={{ fill: '#7A7A74', fontSize: 11, fontWeight: 500, fontFamily: 'DM Sans, Helvetica, sans-serif' }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fill: '#7A7A74', fontSize: 11, fontWeight: 500, fontFamily: 'DM Sans, Helvetica, sans-serif' }}
                  axisLine={false}
                  tickLine={false}
                  dx={-4}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: '#F8F8F6', rx: 6 }} />
                <Bar dataKey="stock_total" shape={<CustomBarShape />} animationDuration={1200} animationEasing="ease-out" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Pie Chart */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.02em', color: '#0E0E0D' }}>Distribución</div>
            <div style={{ fontSize: '12px', color: '#7A7A74', marginTop: '3px' }}>Concentración por categoría</div>
          </div>
          <div style={{ padding: '8px', background: '#fff', border: '1px solid #E5E5E2', borderRadius: '10px', color: '#7A7A74', display: 'flex', alignItems: 'center' }}>
            <PieChartIcon size={18} />
          </div>
        </div>

        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!hasPieData ? (
            <EmptyState icon={PieChartIcon} message="Agrega productos para ver la distribución del inventario." />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    activeIndex={activePieIndex}
                    activeShape={<ActivePieShape />}
                    data={distribution}
                    dataKey="stock_total"
                    nameKey="categoria"
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={100}
                    paddingAngle={3}
                    stroke="none"
                    onMouseEnter={(_, index) => setActivePieIndex(index)}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  >
                    {distribution.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', paddingTop: '8px', borderTop: '1px solid #F0F0EC' }}>
                {distribution.map((entry, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePieIndex(i)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '4px 0',
                      opacity: activePieIndex === i ? 1 : 0.55,
                      transition: 'opacity 0.15s ease',
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', fontWeight: activePieIndex === i ? 600 : 500, color: '#2A2A28' }}>{entry.categoria}</span>
                    <span style={{ fontSize: '11px', color: '#A8A8A0', marginLeft: '2px' }}>{entry.stock_total}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', gap: '12px' }}>
      <div style={{ width: '48px', height: '48px', background: '#F0F0EC', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={22} style={{ color: '#A8A8A0' }} />
      </div>
      <p style={{ fontSize: '13px', color: '#A8A8A0', fontWeight: 500, textAlign: 'center', maxWidth: '200px', lineHeight: 1.5 }}>{message}</p>
    </div>
  );
}