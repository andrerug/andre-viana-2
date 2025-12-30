import React, { useState, useRef, useMemo } from 'react';
import { AspectRatio, CardStyle, GlobalSettings } from '../types';
import { Wand2, Layout, Upload, Type, Image as ImageIcon, Sparkles, UserCircle, Camera, BrainCircuit, PlusCircle, Type as TypeIcon, CheckCircle2, X } from 'lucide-react';
import { generateCardContent } from '../services/geminiService';

interface GeneratorControlsProps {
  onGenerateFromText: (markdown: string) => void;
  onApplyImages: (images: File[]) => void;
  onApplyAutoImages: () => void;
  settings: GlobalSettings;
  onSettingsChange: (newSettings: GlobalSettings) => void;
  onClearAll: () => void;
  hasCards: boolean;
  onUpdateAllFontSizes: (size: number) => void;
  onCloseMobile?: () => void;
}

const StylePreview: React.FC<{ style: CardStyle; active: boolean; onClick: () => void }> = ({ style, active, onClick }) => {
  const getStylePreview = () => {
    switch (style) {
      case CardStyle.PRO_DARK:
        return (
          <div className="w-full aspect-[4/5] bg-[#020617] p-2 flex flex-col justify-end border border-slate-700">
            <div className="h-1 w-4 bg-[#00E5FF] mb-1"></div>
            <div className="text-[6px] font-black text-white uppercase leading-tight">Professional<br/><span className="text-[#00E5FF]">Dark</span></div>
            <div className="h-[2px] w-full bg-slate-800 mt-1"></div>
          </div>
        );
      case CardStyle.PRO_LIGHT:
        return (
          <div className="w-full aspect-[4/5] bg-slate-50 p-2 flex flex-col justify-end border border-slate-300">
            <div className="h-1 w-4 bg-blue-600 mb-1"></div>
            <div className="text-[6px] font-black text-slate-900 uppercase leading-tight">Professional<br/><span className="text-blue-600">Light</span></div>
            <div className="h-[2px] w-full bg-slate-200 mt-1"></div>
          </div>
        );
      case CardStyle.EDU_QUIZ:
        return (
          <div className="w-full aspect-[4/5] bg-white p-2 border border-slate-200">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-2 h-2 rounded-full bg-slate-200"></div>
              <div className="w-4 h-1 bg-slate-100"></div>
            </div>
            <div className="text-[5px] font-bold text-slate-800 leading-tight">Estilo Social Perfil</div>
            <div className="mt-1 w-full h-4 bg-slate-100 rounded"></div>
          </div>
        );
      case CardStyle.BOLD_COLOR:
        return (
          <div className="w-full aspect-[4/5] bg-[#020617] p-2 flex flex-col border border-slate-700">
             <div className="text-[7px] font-black text-white uppercase leading-none">BOLD<br/><span className="text-[#FF5500]">ORANGE</span></div>
             <div className="mt-auto h-4 w-full bg-[#FF5500]"></div>
          </div>
        );
      default: return <div className="w-full aspect-[4/5] bg-slate-800"></div>;
    }
  };

  return (
    <button 
      onClick={onClick}
      className={`relative group rounded-lg overflow-hidden border-2 transition-all ${active ? 'border-brand-500 scale-95 shadow-lg shadow-brand-500/20' : 'border-slate-800 hover:border-slate-700'}`}
    >
      {getStylePreview()}
      <div className={`absolute inset-0 bg-brand-500/10 transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
    </button>
  );
};

export const GeneratorControls: React.FC<GeneratorControlsProps> = ({ 
  onGenerateFromText,
  onApplyImages,
  onApplyAutoImages,
  settings, 
  onSettingsChange,
  onClearAll,
  hasCards,
  onUpdateAllFontSizes,
  onCloseMobile
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'style'>('content');
  const [topic, setTopic] = useState('');
  const [cardCount, setCardCount] = useState(10);
  const [manualText, setManualText] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileImageRef = useRef<HTMLInputElement>(null);

  const detectedCardCount = useMemo(() => {
    if (!manualText.trim()) return 0;
    return manualText.split(/\n\s*-{3,}\s*\n/g).filter(t => t.trim()).length;
  }, [manualText]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);
    }
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      onSettingsChange({ ...settings, profileImage: url });
    }
  };

  const handleAIMagic = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const generatedMarkdown = await generateCardContent(topic, cardCount);
      setManualText(generatedMarkdown);
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar conteúdo.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateCards = () => {
    if (!manualText) {
      alert("Insira ou gere um texto primeiro.");
      return;
    }
    onGenerateFromText(manualText);
  };

  const handleApplySelectedImages = () => {
    if (imageFiles.length === 0) {
      alert("Selecione imagens primeiro.");
      return;
    }
    onApplyImages(imageFiles);
  };

  const handleNewProject = () => {
      if (window.confirm("Deseja iniciar um NOVO PROJETO? Isso apagará todos os cards, textos e imagens atuais.")) {
          setTopic('');
          setManualText('');
          setImageFiles([]);
          setCardCount(10);
          if (fileInputRef.current) fileInputRef.current.value = '';
          onClearAll();
          setActiveTab('content');
      }
  };

  const clearImages = () => {
    setImageFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value);
    onSettingsChange({ ...settings, defaultFontSize: newSize });
    onUpdateAllFontSizes(newSize);
  };

  return (
    <div className="w-[85vw] md:w-96 lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col h-full lg:h-screen overflow-hidden lg:sticky top-0 shadow-2xl z-20">
      <div className="p-6 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-display font-black tracking-tight bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
            <Layout className="text-brand-400" size={20} strokeWidth={3} />
            InstaCard
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Editor em Lote</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleNewProject}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all group"
            title="Novo Projeto (Reset)"
          >
            <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />
          </button>
          {/* Close button for mobile only */}
          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-500"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-800 bg-slate-900">
        <button 
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'content' ? 'text-brand-400 border-b-2 border-brand-400 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Conteúdo
        </button>
        <button 
          onClick={() => setActiveTab('style')}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'style' ? 'text-brand-400 border-b-2 border-brand-400 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Design
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
        {activeTab === 'content' ? (
          <>
            {/* TEXT SECTION */}
            <div className="space-y-4">
              <div className="p-5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-lg">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-300 flex items-center gap-2 mb-3">
                  <Sparkles size={12} /> Sugestão de IA
                </label>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Tema dos cards..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:border-brand-500 outline-none text-white"
                  />
                  <div className="py-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">Quantidade: {cardCount}</span>
                    </div>
                    <input 
                      type="range" min="1" max="100" step="1" value={cardCount}
                      onChange={(e) => setCardCount(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                    />
                  </div>
                  <button 
                    onClick={handleAIMagic}
                    disabled={!topic || isGenerating}
                    className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-brand-400 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-brand-500/30 transition-all flex justify-center items-center gap-2"
                  >
                    {isGenerating ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-brand-400 border-t-transparent"/> : <><Wand2 size={12}/> Gerar Texto com IA</>}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Type size={12} /> Texto dos Cards
                </label>
                <textarea 
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 focus:border-brand-500 outline-none resize-none"
                  placeholder={`# Título\nConteúdo aqui...\n---\n# Post 2...`}
                />
                <button 
                  onClick={handleCreateCards}
                  disabled={!manualText}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black uppercase tracking-widest py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-[10px]"
                >
                  <BrainCircuit size={14} />
                  Criar Cards de Texto
                </button>
                {detectedCardCount > 0 && <p className="text-[9px] text-brand-400 font-bold uppercase text-right">{detectedCardCount} cards detectados</p>}
              </div>
            </div>

            <div className="w-full h-[1px] bg-slate-800" />

            {/* IMAGE SECTION */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <ImageIcon size={12} /> Banco de Imagens
                  </label>
                  {imageFiles.length > 0 && (
                    <button onClick={clearImages} className="text-red-500 hover:text-red-400 text-[9px] font-bold uppercase">Limpar</button>
                  )}
               </div>
               
               <div className="relative border-2 border-dashed border-slate-700 rounded-xl p-6 hover:border-brand-500 transition-all text-center group">
                <input 
                  ref={fileInputRef} type="file" multiple accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <Upload className="mx-auto text-slate-600 mb-2 group-hover:text-brand-400" size={20} />
                <span className="text-[10px] text-slate-500 block font-bold uppercase">
                  {imageFiles.length > 0 ? `${imageFiles.length} imagens selecionadas` : "Selecionar Imagens"}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={handleApplySelectedImages}
                  disabled={imageFiles.length === 0 || !hasCards}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white font-black uppercase tracking-widest py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-[10px]"
                >
                  <CheckCircle2 size={14} />
                  Aplicar Imagens aos Cards
                </button>

                <button 
                  onClick={onApplyAutoImages}
                  disabled={!hasCards}
                  className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-brand-400 font-black uppercase tracking-widest py-3 rounded-xl border border-brand-500/20 transition-all flex items-center justify-center gap-2 text-[10px]"
                >
                  <Sparkles size={14} />
                  Gerar Imagens IA p/ Cards
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-8">
            <div className="space-y-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Galeria de Estilos</span>
                <div className="grid grid-cols-2 gap-3">
                   {[CardStyle.PRO_DARK, CardStyle.PRO_LIGHT, CardStyle.EDU_QUIZ, CardStyle.BOLD_COLOR].map((style) => (
                     <StylePreview 
                        key={style}
                        style={style}
                        active={settings.defaultStyle === style}
                        onClick={() => onSettingsChange({...settings, defaultStyle: style})}
                     />
                   ))}
                </div>
            </div>

            <div className="space-y-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
               <span className="text-[10px] text-brand-300 font-black uppercase tracking-widest flex items-center gap-2">
                 <TypeIcon size={14} /> Tamanho Global da Fonte
               </span>
               <div className="space-y-2">
                 <div className="flex justify-between items-center">
                   <span className="text-[9px] text-slate-500 font-bold uppercase">{settings.defaultFontSize}px</span>
                 </div>
                 <input 
                    type="range" min="12" max="64" step="1" value={settings.defaultFontSize}
                    onChange={handleFontSizeChange}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
               </div>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Formato</span>
              <div className="flex gap-2">
                {[AspectRatio.SQUARE, AspectRatio.PORTRAIT].map(ratio => (
                  <button 
                    key={ratio}
                    onClick={() => onSettingsChange({...settings, aspectRatio: ratio})}
                    className={`flex-1 py-2 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${settings.aspectRatio === ratio ? 'bg-brand-500 text-white border-transparent shadow-lg shadow-brand-500/20' : 'border-slate-800 text-slate-500 hover:border-slate-600'}`}
                  >
                    {ratio === AspectRatio.SQUARE ? 'Square' : 'Portrait'}
                  </button>
                ))}
              </div>
            </div>

            <div className={`space-y-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800 ${settings.defaultStyle === CardStyle.EDU_QUIZ ? 'block' : 'hidden'}`}>
               <span className="text-[10px] text-brand-300 font-black uppercase tracking-widest flex items-center gap-2">
                 <UserCircle size={14} /> Identidade do Perfil
               </span>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden cursor-pointer flex items-center justify-center relative group" onClick={() => profileImageRef.current?.click()}>
                      {settings.profileImage ? <img src={settings.profileImage} className="w-full h-full object-cover" /> : <Camera size={14} className="text-slate-600" />}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Camera size={12} /></div>
                      <input ref={profileImageRef} type="file" accept="image/*" onChange={handleProfileImageUpload} className="hidden" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <input 
                      type="text" placeholder="Nome" value={settings.profileName}
                      onChange={(e) => onSettingsChange({...settings, profileName: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-white"
                    />
                    <input 
                      type="text" placeholder="@handle" value={settings.profileHandle}
                      onChange={(e) => onSettingsChange({...settings, profileHandle: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-500"
                    />
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-slate-900 border-t border-slate-800 text-center">
         <p className="text-[8px] text-slate-600 font-black tracking-widest uppercase">
           InstaCard Genius v3.0 • IA Gemini
         </p>
      </div>
    </div>
  );
};
