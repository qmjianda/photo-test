
import React from 'react';
import { DESIGN_STYLES } from '../constants';
import { DesignStyle } from '../types';

interface StyleCarouselProps {
  onSelect: (style: DesignStyle) => void;
  selectedId?: string;
  disabled?: boolean;
}

const StyleCarousel: React.FC<StyleCarouselProps> = ({ onSelect, selectedId, disabled }) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 px-2">Choose Your Vibe</h3>
      <div className="flex gap-4 overflow-x-auto pb-6 px-2 snap-x no-scrollbar">
        {DESIGN_STYLES.map((style) => (
          <button
            key={style.id}
            disabled={disabled}
            onClick={() => onSelect(style)}
            className={`flex-shrink-0 w-48 group text-left snap-start transition-all duration-300 ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'
            }`}
          >
            <div className={`relative aspect-[4/3] rounded-xl overflow-hidden mb-3 border-4 transition-colors ${
              selectedId === style.id ? 'border-indigo-500 shadow-lg' : 'border-transparent shadow-md'
            }`}>
              <img 
                src={style.thumbnail} 
                alt={style.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                <span className="text-white font-medium text-sm">{style.name}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {style.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StyleCarousel;
