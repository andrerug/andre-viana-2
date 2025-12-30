import React, { useState, useEffect } from 'react';
import { GeneratorControls } from './components/GeneratorControls';
import { CardPreview } from './components/CardPreview';
import { CardConfig, GlobalSettings, AspectRatio, CardStyle, CardLayoutVariant } from './types';
import { DownloadCloud, Layers, Loader2, Sparkles, Settings2, ChevronRight } from 'lucide-react';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { generateImageForCard } from './services/geminiService';

const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  const [cards, setCards] = useState<CardConfig[]>([]);
  const [imagesPool, setImagesPool] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<{current: number, total: number} | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [settings, setSettings] = useState<GlobalSettings>({
    aspectRatio: AspectRatio.PORTRAIT,
    defaultStyle: CardStyle.PRO_DARK,
    defaultOverlayOpacity: 0.6,
    defaultFontSize: 24,
    watermark: '@insta_genius',
    profileName: 'Criador Digital',
    profileHandle: '@seu_instagram',
    profileImage: undefined,
    marketingTagline: 'CURSO ONLINE',
    marketingSeason: '© 2025'
  });

  const handleUpdateAllFontSizes = (size: number) => {
    setCards(prev => prev.map(c => ({ ...c, fontSize: size })));
  };

  const handleGenerateFromText = (markdown: string) => {
    setIsProcessing(true);
    setStatusMessage('Criando estrutura dos cards...');

    const textSegments = markdown
      .split(/\n\s*-{3,}\s*\n/g)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const newCards: CardConfig[] = textSegments.map((text) => ({
      id: generateId(),
      text: text,
      image: undefined,
      backgroundColor: '#050A30',
      textColor: '#ffffff',
      opacity: settings.defaultOverlayOpacity,
      fontSize: settings.defaultFontSize,
      layoutVariant: 'split',
      imageWeight: 35,
      imagePositionX: 50,
      imagePositionY: 50
    }));

    if (cards.length > 0 && window.confirm("Deseja substituir os cards existentes?")) {
      setCards(newCards);
    } else {
      setCards([...cards, ...newCards]);
    }

    setIsProcessing(false);
    setStatusMessage('');
    // No mobile, fecha a sidebar após gerar para ver o resultado
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleApplyImages = (files: File[]) => {
    if (cards.length === 0) return;
    
    setIsProcessing(true);
    setStatusMessage('Aplicando imagens aos cards...');

    const newImageUrls = files.map(file => URL.createObjectURL(file));
    setImagesPool(prev => [...prev, ...newImageUrls]);

    setCards(prevCards => {
      return prevCards.map((card, index) => {
        const imgUrl = newImageUrls[index % newImageUrls.length];
        return { 
          ...card, 
          image: imgUrl,
          imagePositionX: 50,
          imagePositionY: 50
        };
      });
    });

    setIsProcessing(false);
    setStatusMessage('');
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleApplyAutoImages = async () => {
    if (cards.length === 0) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: cards.length });

    const updatedCards = [...cards];
    for (let i = 0; i < updatedCards.length; i++) {
      setStatusMessage(`Gerando imagem IA para card ${i + 1}...`);
      setProgress({ current: i + 1, total: cards.length });
      
      const text = updatedCards[i].text;
      const title = text.split('\n')[0].replace('#', '').trim();
      
      try {
        const aiImage = await generateImageForCard(title);
        if (aiImage) {
          updatedCards[i] = { 
            ...updatedCards[i], 
            image: aiImage,
            imagePositionX: 50,
            imagePositionY: 50
          };
          setImagesPool(prev => [...prev, aiImage]);
        }
        if (i < updatedCards.length - 1) await new Promise(r => setTimeout(r, 1200));
      } catch (err) {
        console.error(err);
      }
    }

    setCards(updatedCards);
    setIsProcessing(false);
    setProgress(null);
    setStatusMessage('');
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleClearAll = () => {
    setCards([]);
    setImagesPool([]);
  };

  const handleUpdateCard = (id: string, updates: Partial<CardConfig>) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleRemoveCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const handleCycleImage = (id: string) => {
    if (imagesPool.length === 0) return;
    setCards(prev => prev.map(c => {
      if (c.id === id) {
        const currentIdx = imagesPool.indexOf(c.image || '');
        const nextIdx = (currentIdx + 1) % imagesPool.length;
        return { 
          ...c, 
          image: imagesPool[nextIdx],
          imagePositionX: 50,
          imagePositionY: 50
        };
      }
      return c;
    }));
  };

  const handleShuffleLayout = (id: string) => {
     const layouts: CardLayoutVariant[] = ['split', 'overlay', 'typo'];
     setCards(prev => prev.map(c => {
       if (c.id === id) {
         const currentIdx = layouts.indexOf(c.layoutVariant || 'split');
         const nextIdx = (currentIdx + 1) % layouts.length;
         return { ...c, layoutVariant: layouts[nextIdx] };
       }
       return c;
     }));
  };

  const handleDownloadAll = async () => {
     if (!window.confirm(`Deseja baixar ${cards.length} cards em alta resolução?`)) return;

     setIsDownloading(true);
     setProgress({ current: 0, total: cards.length });
     setStatusMessage('Convertendo designs para PNG...');
     
     const cardElements = document.querySelectorAll('.insta-card-capture'); 
     if (cardElements.length === 0) {
        setIsDownloading(false);
        return;
     }

     const zip = new JSZip();
     for (let i = 0; i < cardElements.length; i++) {
        setProgress({ current: i + 1, total: cardElements.length });
        try {
            await new Promise(r => setTimeout(r, 200));
            const dataUrl = await toPng(cardElements[i] as HTMLElement, { 
              pixelRatio: 2, 
              useCORS: true,
              cacheBust: true
            });
            zip.file(`card-${(i+1).toString().padStart(3, '0')}.png`, dataUrl.split(',')[1], {base64: true});
        } catch (e) {
            console.error(e);
        }
     }

     setStatusMessage('Compactando ZIP...');
     const content = await zip.generateAsync({type: "blob"});
     const url = window.URL.createObjectURL(content);
     const link = document.createElement('a');
     link.href = url;
     link.download = `insta-pack-${new Date().getTime()}.zip`;
     link.click();
     
     setIsDownloading(false);
     setProgress(null);
     setStatusMessage('');
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Sidebar Overlay Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[25] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Controles */}
      <div className={`fixed inset-y-0 left-0 z-30 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <GeneratorControls 
          onGenerateFromText={handleGenerateFromText}
          onApplyImages={handleApplyImages}
          onApplyAutoImages={handleApplyAutoImages}
          settings={settings}
          onSettingsChange={setSettings}
          onClearAll={handleClearAll}
          hasCards={cards.length > 0}
          onUpdateAllFontSizes={handleUpdateAllFontSizes}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />
      </div>
      
      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto h-screen relative scrollbar-hide">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-slate-900 pb-6">
           <div className="text-center md:text-left">
             <h2 className="text-xl lg:text-2xl font-display font-black flex items-center justify-center md:justify-start gap-3">
               <Layers className="text-brand-400" size={24} />
               Painel de Visualização ({cards.length})
             </h2>
             <p className="text-slate-500 text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.2em] mt-1">Estética ativa: <span className="text-brand-400">{settings.defaultStyle}</span></p>
           </div>
           
           {cards.length > 0 && (
             <button 
               onClick={handleDownloadAll}
               disabled={isDownloading}
               className="w-full md:w-auto bg-brand-600 hover:bg-brand-500 text-white px-6 lg:px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] lg:text-[11px] flex items-center justify-center gap-2 shadow-xl shadow-brand-500/20 transition-all disabled:opacity-50 active:scale-95"
             >
               {isDownloading ? <Loader2 className="animate-spin" size={16} /> : <DownloadCloud size={16} />}
               Baixar Pack
             </button>
           )}
        </div>

        {/* Loading Overlay */}
        {(isProcessing || isDownloading) && (
          <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
             <div className="w-full max-w-sm space-y-8">
                <div className="relative">
                  <Loader2 size={64} className="animate-spin text-brand-500 mx-auto" />
                  <Sparkles size={24} className="absolute top-0 right-1/4 text-brand-300 animate-pulse" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{isDownloading ? 'Preparando ZIP' : 'Processando'}</h3>
                   <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{statusMessage}</p>
                </div>
                
                {progress && (
                  <div className="space-y-3">
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                       <div 
                         className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 transition-all duration-300 shadow-[0_0_15px_rgba(14,165,233,0.3)]" 
                         style={{ width: `${(progress.current / progress.total) * 100}%` }}
                       />
                    </div>
                    <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.3em]">
                       {progress.current} / {progress.total}
                    </p>
                  </div>
                )}
             </div>
          </div>
        )}

        {/* Workspace */}
        {cards.length === 0 && !isProcessing ? (
          <div className="h-[60vh] lg:h-[70vh] flex flex-col items-center justify-center text-slate-600 space-y-6 border-2 border-dashed border-slate-900 rounded-[2rem] lg:rounded-[3rem] bg-slate-900/10 p-6">
             <div className="relative">
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-slate-900 rounded-3xl flex items-center justify-center rotate-12 transition-transform hover:rotate-0 duration-500 cursor-help">
                    <Sparkles size={32} className="text-slate-800" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-500/20 rounded-full blur-xl"></div>
             </div>
             <div className="text-center max-w-xs">
                <p className="text-lg lg:text-xl font-black text-slate-400 uppercase tracking-tighter">Área de Trabalho Vazia</p>
                <p className="text-[10px] lg:text-xs text-slate-600 font-medium leading-relaxed mt-2 uppercase tracking-widest">Toque no botão de configurações para começar a gerar seus cards.</p>
             </div>
             {/* Mobile Hint Button */}
             <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden mt-4 flex items-center gap-2 text-brand-400 font-black uppercase tracking-widest text-[10px] bg-brand-500/10 px-4 py-2 rounded-full border border-brand-500/20"
             >
                Abrir Menu de Criação <ChevronRight size={14} />
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-10 pb-32 max-w-7xl mx-auto">
            {cards.map(card => (
              <CardPreview 
                key={card.id}
                card={card}
                aspectRatio={settings.aspectRatio}
                styleMode={settings.defaultStyle}
                profileName={settings.profileName}
                profileHandle={settings.profileHandle}
                profileImage={settings.profileImage}
                marketingTagline={settings.marketingTagline}
                marketingSeason={settings.marketingSeason}
                onUpdate={handleUpdateCard}
                onRemove={handleRemoveCard}
                onCycleImage={handleCycleImage}
                onShuffleLayout={handleShuffleLayout}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button - Mobile Only */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed bottom-6 right-6 z-40 lg:hidden w-14 h-14 bg-brand-500 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform shadow-brand-500/40"
      >
        <Settings2 size={24} />
      </button>
    </div>
  );
};

export default App;
