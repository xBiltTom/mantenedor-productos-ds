import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function MetricCard({ label, value, helper, icon: Icon }) {
  const isAlert = label.toLowerCase().includes('alerta') || label.toLowerCase().includes('reorden');
  
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-2xl border p-6 sm:p-8 transition-all hover:-translate-y-1 hover:shadow-lg",
      isAlert 
        ? "border-red-200 bg-red-50/50 shadow-red-100/50" 
        : "border-zinc-200 bg-white shadow-sm"
    )}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className={cn(
          "font-semibold text-sm tracking-tight",
          isAlert ? "text-red-700" : "text-zinc-500"
        )}>
          {label}
        </h3>
        {Icon && (
          <div className={cn(
            "p-2.5 rounded-xl transition-transform group-hover:scale-110",
            isAlert ? "bg-red-100 text-red-600" : "bg-zinc-100 text-zinc-600"
          )}>
            <Icon size={20} strokeWidth={2.5} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <span className={cn(
          "text-3xl sm:text-4xl font-bold tracking-tight",
          isAlert ? "text-red-950" : "text-zinc-950"
        )}>
          {value}
        </span>
        
        {helper && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className={cn(
              "px-2 py-0.5 rounded-md text-xs font-medium",
              isAlert ? "bg-red-100 text-red-700" : "bg-zinc-100 text-zinc-600"
            )}>
              {helper}
            </span>
          </div>
        )}
      </div>
      
      {/* Decorative background gradient */}
      <div className={cn(
        "absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-40",
        isAlert ? "bg-red-400" : "bg-zinc-300"
      )} />
    </div>
  );
}