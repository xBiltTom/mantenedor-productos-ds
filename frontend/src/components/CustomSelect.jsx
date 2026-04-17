import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({ value, onChange, options, placeholder = "Seleccionar...", className = "", disabled = false, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex min-h-[46px] w-full items-center justify-between rounded-[10px] border border-[#E5E5E2] bg-[#FAFAF8] px-[14px] py-[10px] text-[14px] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all font-sans cursor-pointer ${isOpen ? 'border-[#0E0E0D] bg-white ring-1 ring-[#0E0E0D]' : 'hover:bg-[#F0F0EC] hover:border-[#D4D4CE]'}`}
        style={Icon ? { paddingLeft: '38px' } : {}}
      >
        {Icon && (
          <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A8A0]" strokeWidth={2} />
        )}
        <span className={`block truncate ${!selectedOption ? 'text-[#7A7A74]' : 'text-[#0E0E0D]'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-[#7A7A74] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
      </button>

      <div 
        className={`absolute z-[100] mt-[6px] w-full rounded-[12px] border border-[#E5E5E2] bg-white p-[6px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] outline-none origin-top transition-all duration-[200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-[0.98] -translate-y-2 pointer-events-none'}`}
      >
        <div className="max-h-[260px] overflow-hidden overflow-y-auto w-full custom-select-scroll">
          <style>{`
            .custom-select-scroll::-webkit-scrollbar { width: 6px; }
            .custom-select-scroll::-webkit-scrollbar-track { background: transparent; }
            .custom-select-scroll::-webkit-scrollbar-thumb { background: #E5E5E2; border-radius: 99px; }
            .custom-select-scroll::-webkit-scrollbar-thumb:hover { background: #D4D4CE; }
          `}</style>
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange({ target: { value: option.value } });
                  setIsOpen(false);
                }}
                className={`relative flex w-full cursor-pointer select-none items-center rounded-lg py-[10px] pl-[12px] pr-[36px] text-[14px] outline-none transition-colors ${isSelected ? 'bg-[#F0F0EC] font-semibold text-[#0E0E0D]' : 'text-[#2A2A28] hover:bg-[#FAFAF8] focus:bg-[#FAFAF8]'}`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && (
                  <span className="absolute right-3 flex items-center justify-center">
                    <Check className="h-[18px] w-[18px] text-[#0E0E0D]" strokeWidth={3} />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  );
}
