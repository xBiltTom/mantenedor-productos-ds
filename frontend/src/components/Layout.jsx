import React, { useState, useEffect } from 'react';
import { Menu, Hexagon } from 'lucide-react';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Cerrar sidebar al cambiar de ruta en móviles
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Manejar resize de ventana
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      
      {/* Header móvil */}
      <header 
        className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b flex items-center justify-between px-5 z-30 shadow-sm"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0E0E0D] rounded-[10px] flex items-center justify-center shadow-md">
            <Hexagon size={16} fill="#F8F8F6" color="#F8F8F6" strokeWidth={0} />
          </div>
          <span className="font-bold text-[#0E0E0D] text-base tracking-tight">SGP</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2.5 -mr-2 text-[#0E0E0D] hover:bg-[#F0F0EC] active:scale-95 rounded-xl transition-all"
          aria-label="Abrir menú"
        >
          <Menu size={24} strokeWidth={2.5} />
        </button>
      </header>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Overlay fondo para móvil */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 overlay-enter"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-[260px] pt-24 md:pt-12 p-6 md:px-12 transition-all w-full min-w-0">
        <div className="max-w-[1100px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}