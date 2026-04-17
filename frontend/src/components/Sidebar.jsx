import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, FileText, Hexagon } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Productos', icon: Package },
  { to: '/reports', label: 'Reportes', icon: FileText }
];

export default function Sidebar() {
  return (
    <>
      <style>{`
        .sgp-nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #7A7A74;
          background: transparent;
          text-decoration: none;
          transition: background 0.15s ease, color 0.15s ease;
          position: relative;
        }
        .sgp-nav-link:hover {
          background: #F0F0EC;
          color: #0E0E0D;
        }
        .sgp-nav-link.active {
          background: #F0F0EC;
          color: #0E0E0D;
          font-weight: 600;
        }
        .sgp-nav-icon {
          color: #A8A8A0;
          flex-shrink: 0;
          transition: color 0.15s ease;
        }
        .sgp-nav-link:hover .sgp-nav-icon,
        .sgp-nav-link.active .sgp-nav-icon {
          color: #0E0E0D;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
      <aside style={{
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        width: '260px',
        display: 'flex',
        flexDirection: 'column',
        background: '#FFFFFF',
        borderRight: '1px solid #E5E5E2',
        zIndex: 40,
      }}>
        {/* Logo */}
        <div style={{ padding: '28px 24px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #E5E5E2' }}>
          <div style={{
            width: '36px', height: '36px',
            background: '#0E0E0D',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Hexagon size={18} fill="#F8F8F6" color="#F8F8F6" strokeWidth={0} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.02em', color: '#0E0E0D', lineHeight: 1.2 }}>SGP</div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A7A74', fontWeight: 500, marginTop: '2px' }}>Gestión de Inventario</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sgp-nav-link${isActive ? ' active' : ''}`}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span style={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      width: '3px', height: '20px',
                      background: '#0E0E0D', borderRadius: '0 3px 3px 0',
                    }} />
                  )}
                  <Icon size={17} className="sgp-nav-icon" />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Status */}
        <div style={{ padding: '16px 12px 24px' }}>
          <div style={{
            background: '#F8F8F6',
            border: '1px solid #E5E5E2',
            borderRadius: '12px',
            padding: '12px 14px',
          }}>
            <div style={{ fontSize: '10px', color: '#A8A8A0', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Estado del Sistema</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22C55E', animation: 'pulse 2s infinite', flexShrink: 0, display: 'inline-block' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0E0E0D' }}>API en línea</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}