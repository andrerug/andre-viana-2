import React, { useRef, useCallback, useMemo, useState } from 'react';
import { CardConfig, AspectRatio, CardStyle } from '../types';
import { X, RefreshCw, ArrowRight, Bookmark, ChevronRight, Shuffle, BadgeCheck, Minus, Plus, Maximize2, Move } from 'lucide-react';
import { toPng } from 'html-to-image';

interface CardPreviewProps {
  card: CardConfig;
  aspectRatio: AspectRatio;
  styleMode: CardStyle;
  profileName?: string;
  profileHandle?: string;
  profileImage?: string;
  marketingTagline?: string;
  marketingSeason?: string;
  onUpdate: (id: string, updates: Partial<CardConfig>) => void;
  onRemove: (id: string) => void;
  onCycleImage: (id: string) => void;
  onShuffleLayout: (id: string) => void;
}

export const CardPreview: React.FC<CardPreviewProps> = ({ 
  card, 
  aspectRatio, 
  styleMode, 
  profileName = 'Especialista',
  profileHandle = '@usuario',
  profileImage,
  marketingTagline = 'ESTUDO DE CASO',
  marketingSeason = 'COPYRIGHT 2025',
  onUpdate,
  onRemove,
  onCycleImage,
  onShuffleLayout
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showPositionControls, setShowPositionControls] = useState(false);

  const handleDownload = useCallback(async () => {
    if (cardRef.current) {
      try {
        const dataUrl = await toPng(cardRef.current, {
            cacheBust: true,
            pixelRatio: 2,
            useCORS: true
        });
        const link = document.createElement('a');
        link.download = `card-${card.id}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to download image', err);
        alert('Erro ao baixar a imagem.');
      }
    }
  }, [card.id]);

  const { title, body } = useMemo(() => {
    const lines = card.text.split('\n').filter(l => l.trim());
    let titleText = '';
    let bodyText = card.text;

    if (lines.length > 0) {
      if (lines[0].startsWith('#')) {
        titleText = lines[0].replace(/^#+\s*/, '');
        bodyText = lines.slice(1).join('\n');
      } else if (lines[0].length < 60 && lines.length > 1) {
         titleText = lines[0];
         bodyText = lines.slice(1).join('\n');
      }
    }
    return { title: titleText, body: bodyText };
  }, [card.text]);

  const renderHighlightedText = (text: string, highlightClass: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <span key={i} className={`${highlightClass} inline-block`}>{part.slice(2, -2)}</span>;
      }
      return part;
    });
  };

  const isPro = styleMode === CardStyle.PRO_DARK || styleMode === CardStyle.PRO_LIGHT;
  const isDark = styleMode === CardStyle.PRO_DARK;
  const isEdu = styleMode === CardStyle.EDU_QUIZ;
  const isMarketing = styleMode === CardStyle.BOLD_COLOR || styleMode === CardStyle.BOLD_BLUE;

  const currentLayout = card.layoutVariant || 'split';

  const adjustFontSize = (delta: number) => {
    onUpdate(card.id, { fontSize: Math.max(8, (card.fontSize || 24) + delta) });
  };

  const toggleImageWeight = () => {
    const weights = [35, 50, 65, 20];
    const current = card.imageWeight || 35;
    const nextIdx = (weights.indexOf(current) + 1) % weights.length;
    onUpdate(card.id, { imageWeight: weights[nextIdx] });
  };

  const imageStyle: React.CSSProperties = {
    objectPosition: `${card.imagePositionX ?? 50}% ${card.imagePositionY ?? 50}%`,
    objectFit: 'cover'
  };

  const renderContent = () => {
    if (isEdu) {
      const titleSize = card.fontSize * 1.3;
      const bodySize = card.fontSize * 0.9;
      const imgHeight = card.imageWeight || 35;

      return (
        <div className="w-full h-full flex flex-col relative overflow-hidden font-sans bg-white text-slate-900 p-8">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100 bg-slate-200">
                  <img src={profileImage || `https://api.dicebear.com/9.x/avataaars/svg?seed=${profileHandle}&backgroundColor=c0aede`} alt="avatar" crossOrigin="anonymous" className="w-full h-full object-cover" />
               </div>
               <div className="flex flex-col leading-tight text-left">
                  <div className="flex items-center gap-1">
                     <span className="font-bold text-sm text-slate-900">{profileName}</span>
                     <BadgeCheck size={16} className="text-blue-500 fill-blue-500 text-white" />
                  </div>
                  <span className="text-xs text-slate-500">{profileHandle}</span>
               </div>
            </div>
            <div className="flex-1 flex flex-col z-10 text-left overflow-hidden">
               {title && (
                 <h2 className="font-display font-extrabold text-slate-800 leading-tight mb-4 tracking-tight" style={{ fontSize: `${titleSize}px` }}>
                    {renderHighlightedText(title, "text-blue-600")}
                 </h2>
               )}
               <div className="font-medium text-slate-600 leading-relaxed whitespace-pre-wrap mb-4 overflow-hidden" style={{ fontSize: `${bodySize}px` }}>
                  {renderHighlightedText(body, "font-bold text-slate-800")}
               </div>
            </div>
            <div 
              className="relative w-full rounded-2xl overflow-hidden mt-auto border border-slate-100 transition-all duration-300" 
              style={{ height: `${imgHeight}%` }}
            >
               {card.image ? (
                  <img src={card.image} style={imageStyle} className="w-full h-full" alt="illustration" />
               ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                     <span className="text-4xl">🖼️</span>
                  </div>
               )}
            </div>
        </div>
      );
    }

    if (isMarketing) {
        const bg = styleMode === CardStyle.BOLD_BLUE ? '#0a0f1d' : '#020617';
        const accent = styleMode === CardStyle.BOLD_BLUE ? '#3B82F6' : '#FF5500';
        const titleSize = card.fontSize * 1.6;
        const bodySize = card.fontSize * 0.9;
        const accentTextClass = styleMode === CardStyle.BOLD_BLUE ? "text-[#3B82F6]" : "text-[#FF5500]";

        const header = (
            <>
               <div className={`absolute top-6 left-8 text-[9px] font-extrabold tracking-[0.2em] uppercase text-slate-400`}>{marketingTagline}</div>
                <div className={`absolute top-6 right-8 text-[9px] font-extrabold tracking-[0.2em] uppercase text-slate-400`}>{marketingSeason}</div>
            </>
        );

        if (currentLayout === 'split') {
            return (
                <div className="w-full h-full relative flex flex-col p-8 pt-12 font-sans" style={{ backgroundColor: bg, color: '#FFF' }}>
                    {header}
                    <div className="flex-1 flex flex-col relative z-10 text-left">
                        {title && (
                             <h2 className="font-display font-black leading-[0.9] tracking-tighter uppercase mb-6" style={{ fontSize: `${titleSize}px` }}>
                                {renderHighlightedText(title, accentTextClass)}
                             </h2>
                        )}
                        <div className="w-16 h-1 mb-6" style={{ backgroundColor: accent }}></div>
                        <div className="flex-1 relative rounded-lg overflow-hidden mb-6 bg-slate-900 border border-slate-800">
                             {card.image ? (
                                    <img src={card.image} style={imageStyle} className="w-full h-full opacity-90" alt="marketing" />
                             ) : (
                                 <div className="w-full h-full flex items-center justify-center opacity-20"><span className="text-4xl">📸</span></div>
                             )}
                             <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: accent }}>
                                 <ArrowRight size={20} className="-rotate-45" strokeWidth={3} />
                             </div>
                        </div>
                        <p className="font-medium leading-relaxed text-slate-300 border-l-2 border-slate-700 pl-4" style={{ fontSize: `${bodySize}px` }}>
                           {renderHighlightedText(body, "text-white font-bold")}
                        </p>
                    </div>
                </div>
            );
        }
        
        return (
          <div className="w-full h-full relative flex flex-col p-8 pt-12 font-sans" style={{ backgroundColor: bg, color: '#FFF' }}>
              {header}
              <div className="flex-1 flex flex-col relative z-10 text-left justify-center">
                  {title && (
                       <h2 className="font-display font-black leading-[1.0] tracking-tighter uppercase mb-4" style={{ fontSize: `${titleSize}px` }}>
                          {renderHighlightedText(title, accentTextClass)}
                       </h2>
                  )}
                  <p className="font-medium leading-relaxed text-slate-300" style={{ fontSize: `${bodySize}px` }}>
                     {renderHighlightedText(body, "text-white font-bold")}
                  </p>
              </div>
          </div>
        );
    }

    if (isPro) {
      const bgHex = isDark ? '#020617' : '#F8FAFC'; 
      const textMain = isDark ? 'text-white' : 'text-slate-900';
      const accentText = isDark ? 'text-[#00E5FF]' : 'text-[#2563EB] font-black'; 
      const titleSize = card.fontSize * 1.4;
      const bodySize = card.fontSize * 0.85;

      return (
          <div className="w-full h-full flex flex-col relative overflow-hidden font-sans" style={{ backgroundColor: bgHex }}>
            <div className="h-1/2 w-full relative overflow-hidden z-0">
               {card.image ? (
                  <img src={card.image} style={imageStyle} className="w-full h-full" alt="bg" />
               ) : (
                  <div className={`w-full h-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'} flex items-center justify-center`}><span className="opacity-20 text-4xl">📷</span></div>
               )}
            </div>
            <div className="h-1/2 w-full relative z-10 px-8 py-6 flex flex-col justify-between text-left">
              <div>
                  <div className={`w-12 h-1.5 mb-5 rounded-full ${isDark ? 'bg-[#00E5FF]' : 'bg-blue-600'}`} />
                  {title && (
                    <h2 className={`font-display font-black uppercase tracking-tight leading-[1.0] mb-4 ${textMain}`} style={{ fontSize: `${titleSize}px` }}>
                      {renderHighlightedText(title, accentText)}
                    </h2>
                  )}
                  <div className={`font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'} whitespace-pre-wrap`} style={{ fontSize: `${bodySize}px` }}>
                    {renderHighlightedText(body, isDark ? 'text-white font-bold' : 'text-blue-900 font-bold')}
                  </div>
              </div>
            </div>
          </div>
      );
    }

    return (
      <div className="relative w-full h-full flex items-center justify-center p-8" style={{ backgroundColor: card.backgroundColor }}>
        {card.image && <img src={card.image} style={imageStyle} className="absolute inset-0 w-full h-full opacity-50" />}
        <div className="absolute inset-0" style={{ backgroundColor: card.backgroundColor, opacity: card.opacity }} />
        <div className="relative z-10 w-full whitespace-pre-wrap font-bold text-center" style={{ color: card.textColor, fontSize: `${card.fontSize}px` }}>{card.text}</div>
      </div>
    );
  };

  return (
    <div 
      className="relative group shadow-2xl rounded-sm overflow-hidden border border-slate-800 bg-slate-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowPositionControls(false);
      }}
    >
      {/* Control Bar */}
      <div className={`absolute top-3 right-3 flex flex-wrap justify-end gap-2 z-50 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
         
         {/* Position Panel Overlay */}
         {showPositionControls && (
            <div className="absolute top-12 right-0 bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl min-w-[180px] space-y-4 animate-in fade-in zoom-in duration-200">
               <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
                    <span>Posição X (Lados)</span>
                    <span>{card.imagePositionX ?? 50}%</span>
                 </div>
                 <input 
                   type="range" min="0" max="100" step="1" 
                   value={card.imagePositionX ?? 50} 
                   onChange={(e) => onUpdate(card.id, { imagePositionX: parseInt(e.target.value) })}
                   className="w-full h-1 bg-slate-700 rounded-full appearance-none accent-brand-500"
                 />
               </div>
               <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
                    <span>Posição Y (Topo/Base)</span>
                    <span>{card.imagePositionY ?? 50}%</span>
                 </div>
                 <input 
                   type="range" min="0" max="100" step="1" 
                   value={card.imagePositionY ?? 50} 
                   onChange={(e) => onUpdate(card.id, { imagePositionY: parseInt(e.target.value) })}
                   className="w-full h-1 bg-slate-700 rounded-full appearance-none accent-brand-500"
                 />
               </div>
               <button 
                onClick={() => onUpdate(card.id, { imagePositionX: 50, imagePositionY: 50 })}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-[9px] font-black uppercase text-slate-400 rounded-lg transition-colors"
               >
                Resetar Posição
               </button>
            </div>
         )}

         {/* Font Size Controls */}
         <div className="flex bg-black/60 rounded-full backdrop-blur-md border border-white/10 px-1 items-center">
            <button onClick={() => adjustFontSize(-1)} className="p-1.5 hover:text-brand-400 transition-colors"><Minus size={12} /></button>
            <span className="text-[10px] font-bold px-1 min-w-[20px] text-center">{card.fontSize}</span>
            <button onClick={() => adjustFontSize(1)} className="p-1.5 hover:text-brand-400 transition-colors"><Plus size={12} /></button>
         </div>

         {/* Layout/Style Controls */}
         <div className="flex gap-2">
            {card.image && (
              <button 
                onClick={() => setShowPositionControls(!showPositionControls)} 
                className={`p-2 rounded-full backdrop-blur-md transition-colors border border-white/10 ${showPositionControls ? 'bg-brand-500 text-white' : 'bg-black/60 text-white hover:bg-brand-500'}`}
                title="Ajustar Posição da Imagem"
              >
                <Move size={14} />
              </button>
            )}
            {isEdu && (
              <button 
                onClick={toggleImageWeight} 
                className="bg-black/60 text-white p-2 rounded-full hover:bg-brand-500 backdrop-blur-md transition-colors border border-white/10"
                title="Ajustar Altura da Caixa"
              >
                <Maximize2 size={14} />
              </button>
            )}
            <button onClick={() => onShuffleLayout(card.id)} className="bg-black/60 text-white p-2 rounded-full hover:bg-purple-500 backdrop-blur-md transition-colors border border-white/10"><Shuffle size={14} /></button>
            <button onClick={() => onCycleImage(card.id)} className="bg-black/60 text-white p-2 rounded-full hover:bg-brand-500 backdrop-blur-md transition-colors border border-white/10"><RefreshCw size={14} /></button>
            <button onClick={handleDownload} className="bg-black/60 text-white p-2 rounded-full hover:bg-green-500 backdrop-blur-md transition-colors border border-white/10"><ArrowRight size={14} className="rotate-90" /></button>
            <button onClick={() => onRemove(card.id)} className="bg-black/60 text-white p-2 rounded-full hover:bg-red-500 backdrop-blur-md transition-colors border border-white/10"><X size={14} /></button>
         </div>
      </div>

      <div ref={cardRef} className={`w-full ${aspectRatio === AspectRatio.SQUARE ? 'aspect-square' : 'aspect-[4/5]'} insta-card-capture`}>
        <div className="w-full h-full outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(card.id, { text: e.currentTarget.innerText })}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
