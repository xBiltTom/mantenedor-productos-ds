import React from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <Sidebar />
      <main className="flex-1 md:ml-[260px] p-6 md:p-12 transition-all">
        <div className="max-w-[1100px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}