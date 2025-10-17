import React, { useState, useEffect } from 'react';
import { LightSetupResult, DiagramElement } from '../types';
import LightingDiagram from './LightingDiagram';
import Spinner from './Spinner';
import Logo from './Logo';

interface DisplayAreaProps {
  result: LightSetupResult | null;
  imageUrl?: string;
  isLoading: boolean;
  error: string | null;
  backdropColor: string;
  onBackdropColorChange: (color: string) => void;
  isGridVisible: boolean;
  onGridVisibilityChange: (isVisible: boolean) => void;
  areEffectsVisible: boolean;
  onEffectsVisibilityChange: (isVisible: boolean) => void;
  onUpdateLight: (index: number, updates: Partial<DiagramElement>) => void;
  onUpdateCamera: (updates: Partial<DiagramElement>) => void;
}

const PREDEFINED_COLORS = ['#1a1625', '#000000', '#ffffff', '#374151', '#1e3a8a', 'gray-800'];

const BackdropControls: React.FC<Omit<DisplayAreaProps, 'result' | 'imageUrl' | 'isLoading' | 'error' | 'onUpdateLight' | 'onUpdateCamera'>> = ({
  backdropColor, onBackdropColorChange, isGridVisible, onGridVisibilityChange, areEffectsVisible, onEffectsVisibilityChange
}) => {
  const [customColor, setCustomColor] = useState(backdropColor.startsWith('#') ? backdropColor : '#1f2937');

  useEffect(() => {
    if (backdropColor.startsWith('#')) {
      setCustomColor(backdropColor);
    } else {
      const colorMap: {[key: string]: string} = { 'gray-800': '#1f2937' };
      setCustomColor(colorMap[backdropColor] || '#1f2937');
    }
  }, [backdropColor]);

  const handleCustomColorApply = () => {
    if (/^#([0-9A-F]{3}){1,2}$/i.test(customColor)) {
      onBackdropColorChange(customColor);
    } else {
      const colorMap: {[key: string]: string} = { 'gray-800': '#1f2937' };
      setCustomColor(backdropColor.startsWith('#') ? backdropColor : (colorMap[backdropColor] || '#1f2937'));
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleCustomColorApply();
        e.currentTarget.blur();
    }
  }

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onBackdropColorChange(newColor);
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4 bg-indigo-950/50 p-2 rounded-md border border-indigo-800">
      <div className="flex items-center gap-1 sm:gap-2">
        {PREDEFINED_COLORS.map(c => (
           <button 
            key={c} 
            onClick={() => onBackdropColorChange(c)} 
            style={c.startsWith('#') ? {backgroundColor: c} : {}}
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all ${c.startsWith('#') ? '' : `bg-${c}`} ${backdropColor === c ? 'border-amber-400 scale-110' : 'border-gray-600 hover:border-gray-400'}`} 
            aria-label={`Set background to ${c}`}
           />
        ))}
      </div>
      <div className="flex items-center gap-2 bg-indigo-900 border border-indigo-700 rounded-md p-1">
         <div className="relative w-6 h-6 cursor-pointer group">
            <input 
                type="color"
                id="backdrop-color-picker"
                value={customColor}
                onChange={handlePickerChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Pick a custom color"
            />
            <div 
                style={{backgroundColor: customColor}} 
                className="w-full h-full rounded-sm border border-gray-500 pointer-events-none"
            />
         </div>
         <input 
            type="text"
            value={customColor} 
            onChange={e => setCustomColor(e.target.value)} 
            onBlur={handleCustomColorApply}
            onKeyDown={handleKeyDown}
            className="w-20 p-1 text-xs sm:text-sm bg-transparent border-none rounded-md focus:ring-0 focus:outline-none"
            aria-label="Custom color hex code"
         />
      </div>
      <div className="h-6 w-px bg-indigo-700"></div>
       <div className="flex items-center gap-2">
          <label htmlFor="gridToggle" className="text-sm text-gray-300 select-none">Grid</label>
          <button 
            id="gridToggle"
            onClick={() => onGridVisibilityChange(!isGridVisible)} 
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-indigo-900 ${isGridVisible ? 'bg-amber-400' : 'bg-indigo-700'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isGridVisible ? 'translate-x-5' : 'translate-x-0'}`}/>
          </button>
       </div>
      <div className="h-6 w-px bg-indigo-700"></div>
       <div className="flex items-center gap-2">
          <label htmlFor="effectsToggle" className="text-sm text-gray-300 select-none">FX</label>
          <button 
            id="effectsToggle"
            onClick={() => onEffectsVisibilityChange(!areEffectsVisible)} 
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-indigo-900 ${areEffectsVisible ? 'bg-amber-400' : 'bg-indigo-700'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${areEffectsVisible ? 'translate-x-5' : 'translate-x-0'}`}/>
          </button>
       </div>
    </div>
  );
}


const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center text-center">
    <Spinner size="lg" className="mb-4" />
    <p className="text-xl font-semibold">AI Işık Yönetmeni Çalışıyor...</p>
    <p className="text-gray-400">Şema ve görsel oluşturuluyor, lütfen bekleyin.</p>
  </div>
);

const WelcomeMessage: React.FC = () => (
  <div className="text-center flex flex-col items-center">
    <Logo className="w-24 h-24 mb-6 opacity-30" />
    <h2 className="text-3xl font-bold text-white">Stüdyo Simülatörüne Hoş Geldiniz</h2>
    <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto">
      Sol taraftaki paneli kullanarak çekim senaryonuzu oluşturun ve "Analiz Et & Görselleştir" butonuna tıklayarak ışık kurulumunuzu ve potansiyel sonucunuzu anında görselleştirin.
    </p>
  </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
        <strong className="font-bold">Bir Hata Oluştu:</strong>
        <span className="block sm:inline ml-2">{message}</span>
    </div>
);

const DisplayArea: React.FC<DisplayAreaProps> = ({ result, imageUrl, isLoading, error, backdropColor, onBackdropColorChange, isGridVisible, onGridVisibilityChange, areEffectsVisible, onEffectsVisibilityChange, onUpdateLight, onUpdateCamera }) => {
  const handleSaveImage = () => {
    if (imageUrl) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `studio_setup_${new Date().getTime()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  }

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorDisplay message={error} />;
    if (!result) return <WelcomeMessage />;

    return (
      <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
              <h3 className="text-xl font-bold text-amber-400">2D Işık Kurulum Diyagramı</h3>
              <BackdropControls 
                backdropColor={backdropColor}
                onBackdropColorChange={onBackdropColorChange}
                isGridVisible={isGridVisible}
                onGridVisibilityChange={onGridVisibilityChange}
                areEffectsVisible={areEffectsVisible}
                onEffectsVisibilityChange={onEffectsVisibilityChange}
              />
            </div>
            <div className="aspect-square bg-[#281c3b] rounded-lg p-4 border border-indigo-800/50 shadow-lg shadow-purple-900/20">
              <LightingDiagram 
                diagram={result.diagram}
                backdropColor={backdropColor}
                isGridVisible={isGridVisible}
                areEffectsVisible={areEffectsVisible}
                onUpdateLight={onUpdateLight}
                onUpdateCamera={onUpdateCamera}
              />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-amber-400 mb-3">Aydınlatma Analizi</h3>
            <div className="bg-[#281c3b] rounded-lg p-4 border border-indigo-800/50 text-gray-300 prose prose-invert prose-sm max-w-none prose-p:my-2">
              <p>{result.analysis}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-bold text-amber-400">Örnek Görüntü</h3>
            {imageUrl && (
              <button onClick={handleSaveImage} className="text-sm bg-green-600 hover:bg-green-500 text-white font-bold py-1.5 px-3 rounded-md transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Kaydet
              </button>
            )}
          </div>
          <div className="flex-grow aspect-[3/4] bg-[#281c3b] rounded-lg border border-indigo-800/50 flex items-center justify-center overflow-hidden shadow-lg shadow-purple-900/20">
            {imageUrl ? (
              <img src={imageUrl} alt="AI generated sample" className="w-full h-full object-contain" />
            ) : (
                <div className="text-gray-500">Görüntü oluşturuluyor...</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-black/20 rounded-lg border border-white/10">
      {renderContent()}
    </div>
  );
};

export default DisplayArea;