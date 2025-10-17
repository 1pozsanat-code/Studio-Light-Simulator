import React, { useState, useEffect } from 'react';
import { PRESETS, LIGHTING_PRESETS } from '../constants.ts';
import { Preset, LightingPreset, LightSetupResult, DiagramElement } from '../types.ts';
import Spinner from './Spinner.tsx';

interface PromptControlsProps {
  onGenerate: (scenario: string, selections: { [key: string]: string[] }) => void;
  isLoading: boolean;
  isReconfiguring: boolean;
  onReconfigure: () => void;
  currentResult: LightSetupResult | null;
  onUpdateLight: (index: number, updates: Partial<DiagramElement>) => void;
  onUpdateCamera: (updates: Partial<DiagramElement>) => void;
  isAutoUpdateEnabled: boolean;
  onAutoUpdateChange: (enabled: boolean) => void;
}

const PresetLightingSection: React.FC<{ onSelect: (preset: LightingPreset) => void }> = ({ onSelect }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-amber-400 mb-3">Hızlı Başlangıç Presetleri</h3>
    <div className="flex flex-wrap gap-2">
      {LIGHTING_PRESETS.map(preset => (
        <button
          key={preset.name}
          onClick={() => onSelect(preset)}
          className="px-4 py-2 text-sm rounded-md transition-all duration-200 border bg-indigo-900 border-indigo-700 hover:bg-amber-400 hover:border-amber-400 hover:text-purple-900 text-gray-200"
        >
          {preset.name}
        </button>
      ))}
    </div>
  </div>
);

interface CustomPresetSectionProps {
    presets: LightingPreset[];
    onSelect: (preset: LightingPreset) => void;
    onDelete: (name: string) => void;
    editingPresetName: string | null;
    editingValue: string;
    setEditingValue: (value: string) => void;
    onStartEdit: (name: string) => void;
    onCancelEdit: () => void;
    onSaveEdit: (oldName: string, newName: string) => void;
}


const CustomPresetSection: React.FC<CustomPresetSectionProps> = ({ 
    presets, onSelect, onDelete, editingPresetName, editingValue, setEditingValue, onStartEdit, onCancelEdit, onSaveEdit
}) => {
    if (presets.length === 0) {
        return null;
    }
    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold text-amber-400 mb-3">Kaydedilmiş Presetler</h3>
            <div className="flex flex-wrap gap-2">
            {presets.map(preset => (
                <div key={preset.name} className="relative group flex items-center">
                    {editingPresetName === preset.name ? (
                        <div className="flex items-center gap-2 p-1 rounded-md bg-purple-900 border border-amber-400">
                            <input
                                type="text"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                className="px-2 py-1 text-sm bg-indigo-950 border border-indigo-700 rounded-md focus:ring-1 focus:ring-amber-400 w-32"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') onSaveEdit(preset.name, editingValue);
                                    if (e.key === 'Escape') onCancelEdit();
                                }}
                                autoFocus
                            />
                            <button onClick={() => onSaveEdit(preset.name, editingValue)} className="text-green-400 hover:text-green-300 p-1 rounded-full" aria-label="Save name">✓</button>
                            <button onClick={onCancelEdit} className="text-red-400 hover:text-red-300 p-1 rounded-full" aria-label="Cancel edit">×</button>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => onSelect(preset)}
                                className="pr-12 pl-4 py-2 text-sm rounded-md transition-all duration-200 border bg-purple-900 border-purple-700 hover:bg-amber-400 hover:border-amber-400 hover:text-purple-900 text-gray-200"
                            >
                                {preset.name}
                            </button>
                            <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onStartEdit(preset.name)}
                                    className="w-5 h-5 flex items-center justify-center rounded-full bg-purple-800/50 text-purple-300 hover:bg-blue-500 hover:text-white"
                                    aria-label={`Edit ${preset.name}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                </button>
                                <button
                                    onClick={() => onDelete(preset.name)}
                                    className="w-5 h-5 flex items-center justify-center rounded-full bg-purple-800/50 text-purple-300 hover:bg-red-500 hover:text-white"
                                    aria-label={`Delete ${preset.name}`}
                                >
                                    &times;
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))}
            </div>
        </div>
    );
};


const PresetSection: React.FC<{ preset: Preset, selectedOptions: string[], onToggle: (option: string) => void }> = ({ preset, selectedOptions, onToggle }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-amber-400 mb-3">{preset.category}</h3>
    <div className="flex flex-wrap gap-2">
      {preset.options.map(option => {
        const isSelected = selectedOptions.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`px-3 py-1.5 text-sm rounded-full transition-all duration-200 border
              ${isSelected
                ? 'bg-amber-400 border-amber-400 text-purple-900 font-bold ring-2 ring-amber-300 ring-offset-2 ring-offset-[#1e192f]'
                : 'bg-indigo-900 border-indigo-700 hover:bg-indigo-800 hover:border-indigo-600 text-gray-300'
              }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  </div>
);

const lightSourceOptions = PRESETS.find(p => p.category === 'Ana Işık Kaynakları')?.options || [];

const CameraControlSection: React.FC<{ camera: DiagramElement, onUpdate: (updates: Partial<DiagramElement>) => void }> = ({ camera, onUpdate }) => {
    const sliderBaseClasses = "w-full h-1.5 bg-gradient-to-r from-indigo-800 to-purple-800 rounded-lg appearance-none cursor-pointer";
    const sliderThumbClasses = "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:shadow-[0_0_5px_rgba(251,191,36,0.7)] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-amber-400 [&::-moz-range-thumb]:shadow-[0_0_5px_rgba(251,191,36,0.7)] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none";

    return (
        <div className="mb-6 p-4 border border-indigo-800 rounded-lg bg-[#14111d]/50">
            <h3 className="text-lg font-semibold text-amber-400 mb-4">Kamera Kontrolü</h3>
            <div className="space-y-4">
                <div className="relative group">
                    <label htmlFor="camera-x" className="flex justify-between text-xs font-medium text-gray-300 mb-1">
                        <span>X Pozisyonu</span>
                        <span>{Math.round(camera.x)}</span>
                    </label>
                    <input 
                        type="range" 
                        id="camera-x"
                        min="0" 
                        max="100" 
                        value={camera.x}
                        onChange={(e) => onUpdate({ x: parseInt(e.target.value, 10) })}
                        className={`${sliderBaseClasses} ${sliderThumbClasses}`}
                    />
                </div>
                <div className="relative group">
                    <label htmlFor="camera-y" className="flex justify-between text-xs font-medium text-gray-300 mb-1">
                        <span>Y Pozisyonu</span>
                        <span>{Math.round(camera.y)}</span>
                    </label>
                    <input 
                        type="range" 
                        id="camera-y"
                        min="0" 
                        max="100" 
                        value={camera.y}
                        onChange={(e) => onUpdate({ y: parseInt(e.target.value, 10) })}
                        className={`${sliderBaseClasses} ${sliderThumbClasses}`}
                    />
                </div>
                <div className="relative group">
                    <label htmlFor="camera-angle" className="flex justify-between text-xs font-medium text-gray-300 mb-1">
                        <span>Yön Açısı</span>
                        <span>{camera.angle || 0}°</span>
                    </label>
                    <input 
                        type="range" 
                        id="camera-angle"
                        min="0" 
                        max="360" 
                        value={camera.angle || 0}
                        onChange={(e) => onUpdate({ angle: parseInt(e.target.value, 10) })}
                        className={`${sliderBaseClasses} ${sliderThumbClasses}`}
                    />
                </div>
                <div className="relative group">
                    <label htmlFor="camera-focal-length" className="flex justify-between text-xs font-medium text-gray-300 mb-1">
                        <span>Lens Uzaklığı</span>
                        <span>{camera.focalLength || 50}mm</span>
                    </label>
                    <input 
                        type="range" 
                        id="camera-focal-length"
                        min="24" 
                        max="200" 
                        step="1"
                        value={camera.focalLength || 50}
                        onChange={(e) => onUpdate({ focalLength: parseInt(e.target.value, 10) })}
                        className={`${sliderBaseClasses} ${sliderThumbClasses}`}
                    />
                </div>
            </div>
        </div>
    );
};

const IndividualLightControl: React.FC<{ light: DiagramElement, index: number, onUpdate: (index: number, updates: Partial<DiagramElement>) => void }> = ({ light, index, onUpdate }) => {
    
    const sliderBaseClasses = "w-full h-1.5 bg-gradient-to-r from-indigo-800 to-purple-800 rounded-lg appearance-none cursor-pointer";
    const sliderThumbClasses = "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:shadow-[0_0_5px_rgba(251,191,36,0.7)] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-amber-400 [&::-moz-range-thumb]:shadow-[0_0_5px_rgba(251,191,36,0.7)] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none";
    const tooltipClasses = "absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 bg-black text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none";

    // Ensure the current light type is in the dropdown, even if it's not a standard preset option.
    const allLightTypeOptions = [...lightSourceOptions];
    if (light.type && !allLightTypeOptions.includes(light.type)) {
        allLightTypeOptions.push(light.type);
    }

    return (
        <div className="p-3 bg-indigo-900/60 border border-indigo-700/50 rounded-lg">
            <div className="flex justify-between items-center">
                <label htmlFor={`light-type-${index}`} className="font-semibold text-white">{light.label}</label>
                <select
                    id={`light-type-${index}`}
                    value={light.type || ''}
                    onChange={(e) => onUpdate(index, { type: e.target.value })}
                    className="max-w-[150px] text-ellipsis px-2 py-1 text-xs bg-indigo-950 border border-indigo-700 rounded-md focus:ring-1 focus:ring-amber-400 text-gray-300"
                    aria-label={`Light type for ${light.label}`}
                >
                    {allLightTypeOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </div>
            
            <div className="mt-4 space-y-4">
                <div className="relative group">
                    <label htmlFor={`intensity-${index}`} className="flex justify-between text-xs font-medium text-gray-300 mb-1">
                        <span>Yoğunluk</span>
                        <span>{light.intensity || 0}%</span>
                    </label>
                    <input 
                        type="range" 
                        id={`intensity-${index}`}
                        min="0" 
                        max="100" 
                        value={light.intensity || 0}
                        onChange={(e) => onUpdate(index, { intensity: parseInt(e.target.value, 10) })}
                        className={`${sliderBaseClasses} ${sliderThumbClasses}`}
                    />
                    <span className={tooltipClasses}>Işığın parlaklığını ayarlar.</span>
                </div>
                <div className="relative group">
                    <label htmlFor={`colorTemp-${index}`} className="flex justify-between text-xs font-medium text-gray-300 mb-1">
                        <span>Renk Sıcaklığı</span>
                        <span>{light.colorTemperature || 5500}K</span>
                    </label>
                    <input 
                        type="range" 
                        id={`colorTemp-${index}`}
                        min="2000" 
                        max="10000" 
                        step="100"
                        value={light.colorTemperature || 5500}
                        onChange={(e) => onUpdate(index, { colorTemperature: parseInt(e.target.value, 10) })}
                        className={`${sliderBaseClasses} ${sliderThumbClasses}`}
                    />
                    <span className={tooltipClasses}>Işığın rengini sıcaktan (turuncu) soğuğa (mavi) değiştirir.</span>
                </div>
                <div className="relative group">
                    <label htmlFor={`beamAngle-${index}`} className="flex justify-between text-xs font-medium text-gray-300 mb-1">
                        <span>Işın Açısı</span>
                        <span>{light.beamAngle || 90}°</span>
                    </label>
                    <input 
                        type="range" 
                        id={`beamAngle-${index}`}
                        min="10" 
                        max="180" 
                        value={light.beamAngle || 90}
                        onChange={(e) => onUpdate(index, { beamAngle: parseInt(e.target.value, 10) })}
                        className={`${sliderBaseClasses} ${sliderThumbClasses}`}
                    />
                    <span className={tooltipClasses}>Işığın yayılma açısını dar veya geniş olarak ayarlar.</span>
                </div>
                <div className="relative group">
                    <label htmlFor={`angle-${index}`} className="flex justify-between text-xs font-medium text-gray-300 mb-1">
                        <span>Yön Açısı</span>
                        <span>{light.angle || 0}°</span>
                    </label>
                    <input 
                        type="range" 
                        id={`angle-${index}`}
                        min="0" 
                        max="360" 
                        value={light.angle || 0}
                        onChange={(e) => onUpdate(index, { angle: parseInt(e.target.value, 10) })}
                        className={`${sliderBaseClasses} ${sliderThumbClasses}`}
                    />
                    <span className={tooltipClasses}>Işığın diyagram üzerindeki yönünü değiştirir.</span>
                </div>
            </div>
        </div>
    );
};

const IndividualLightControlsSection: React.FC<{ lights: DiagramElement[], onUpdate: (index: number, updates: Partial<DiagramElement>) => void }> = ({ lights, onUpdate }) => {
    return (
        <div className="mb-6 p-4 border border-indigo-800 rounded-lg bg-[#14111d]/50">
            <h3 className="text-lg font-semibold text-amber-400 mb-4">Gelişmiş Işık Kontrolü</h3>
            <div className="space-y-3">
                {lights.map((light, i) => (
                    <IndividualLightControl
                        key={`${light.label}-${i}`}
                        light={light}
                        index={i}
                        onUpdate={onUpdate}
                    />
                ))}
            </div>
        </div>
    );
};

const AutoUpdateToggle: React.FC<{ isEnabled: boolean, onChange: (enabled: boolean) => void }> = ({ isEnabled, onChange }) => (
    <div className="flex items-center justify-between p-3 my-4 bg-indigo-900/60 border border-indigo-700/50 rounded-lg">
        <label htmlFor="autoUpdateToggle" className="text-sm font-medium text-gray-200">
            Otomatik Güncelle
            <span className="block text-xs text-gray-400">Değişiklikleri anında uygula</span>
        </label>
        <button 
            id="autoUpdateToggle"
            onClick={() => onChange(!isEnabled)} 
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-indigo-900 ${isEnabled ? 'bg-amber-400' : 'bg-gray-600'}`}
        >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`}/>
        </button>
    </div>
);


const PromptControls: React.FC<PromptControlsProps> = ({ 
  onGenerate, 
  isLoading, 
  isReconfiguring, 
  onReconfigure, 
  currentResult, 
  onUpdateLight, 
  onUpdateCamera,
  isAutoUpdateEnabled,
  onAutoUpdateChange,
}) => {
  const [scenario, setScenario] = useState('');
  const [selections, setSelections] = useState<{ [key: string]: string[] }>({});
  const [customPresets, setCustomPresets] = useState<LightingPreset[]>([]);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [editingPresetName, setEditingPresetName] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');


  useEffect(() => {
    try {
      const savedPresets = localStorage.getItem('customLightingPresets');
      if (savedPresets) {
        setCustomPresets(JSON.parse(savedPresets));
      }
    } catch (error) {
      console.error("Failed to load custom presets from localStorage", error);
    }
  }, []);

  const handleSelectPreset = (preset: LightingPreset) => {
    setScenario(preset.scenario);
    setSelections(preset.selections || {});
  };

  const handleToggle = (category: string, option: string) => {
    setSelections(prev => {
      const currentCategorySelections = prev[category] || [];
      const newSelections = currentCategorySelections.includes(option)
        ? currentCategorySelections.filter(item => item !== option)
        : [...currentCategorySelections, option];
      return { ...prev, [category]: newSelections };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scenario.trim()) {
      onGenerate(scenario, selections);
    }
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim() || !scenario.trim()) return;
    const trimmedName = newPresetName.trim();
    const existingPreset = customPresets.find(p => p.name.toLowerCase() === trimmedName.toLowerCase());

    const newPresetData: LightingPreset = {
        name: trimmedName,
        scenario,
        selections,
    };

    if (existingPreset) {
        if (window.confirm(`"${trimmedName}" adında bir preset zaten var. Üzerine yazmak istiyor musunuz?`)) {
            const updatedPresets = customPresets.map(p => p.name.toLowerCase() === trimmedName.toLowerCase() ? newPresetData : p);
            setCustomPresets(updatedPresets);
            localStorage.setItem('customLightingPresets', JSON.stringify(updatedPresets));
        } else {
            return; 
        }
    } else {
        const updatedPresets = [...customPresets, newPresetData];
        setCustomPresets(updatedPresets);
        localStorage.setItem('customLightingPresets', JSON.stringify(updatedPresets));
    }
    
    setNewPresetName('');
    setShowSaveInput(false);
  };

  const handleDeletePreset = (nameToDelete: string) => {
      if (window.confirm(`"${nameToDelete}" presetini silmek istediğinizden emin misiniz?`)) {
        const updatedPresets = customPresets.filter(p => p.name !== nameToDelete);
        setCustomPresets(updatedPresets);
        localStorage.setItem('customLightingPresets', JSON.stringify(updatedPresets));
      }
  };
  
  const handleStartEdit = (name: string) => {
    setEditingPresetName(name);
    setEditingValue(name);
  };

  const handleCancelEdit = () => {
      setEditingPresetName(null);
      setEditingValue('');
  };

  const handleSaveEdit = (oldName: string, newName: string) => {
      const trimmedNewName = newName.trim();
      if (!trimmedNewName || trimmedNewName === oldName) {
          handleCancelEdit();
          return;
      }

      const isNameTaken = customPresets.some(p => p.name.toLowerCase() === trimmedNewName.toLowerCase() && p.name.toLowerCase() !== oldName.toLowerCase());
      if (isNameTaken) {
          alert("Bu isimde başka bir preset zaten var. Lütfen farklı bir isim seçin.");
          return;
      }

      const updatedPresets = customPresets.map(p =>
          p.name === oldName ? { ...p, name: trimmedNewName } : p
      );

      setCustomPresets(updatedPresets);
      localStorage.setItem('customLightingPresets', JSON.stringify(updatedPresets));
      handleCancelEdit();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow">
        <h2 className="text-2xl font-bold text-white mb-4">Işık Analiz Alanı</h2>
        
        <PresetLightingSection onSelect={handleSelectPreset} />
        <CustomPresetSection 
            presets={customPresets} 
            onSelect={handleSelectPreset} 
            onDelete={handleDeletePreset}
            editingPresetName={editingPresetName}
            editingValue={editingValue}
            setEditingValue={setEditingValue}
            onStartEdit={handleStartEdit}
            onCancelEdit={handleCancelEdit}
            onSaveEdit={handleSaveEdit}
        />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="scenario" className="block text-lg font-semibold text-gray-300 mb-2">
              Çekim Senaryosu
            </label>
            <textarea
              id="scenario"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="Örn: Dramatik, düşük ışıklı bir erkek portresi..."
              className="w-full h-24 p-3 bg-indigo-900 border border-indigo-700 rounded-md focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors"
              rows={3}
            />
          </div>

          {showSaveInput ? (
            <div className="p-3 bg-indigo-900/70 border border-indigo-700 rounded-lg flex flex-col sm:flex-row gap-2 items-center">
                <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Preset Adı"
                    className="flex-grow w-full sm:w-auto p-2 bg-indigo-950 border border-indigo-700 rounded-md focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors"
                    aria-label="New preset name"
                />
                <div className="flex gap-2">
                    <button type="button" onClick={handleSavePreset} className="px-4 py-2 text-sm rounded-md bg-green-600 hover:bg-green-500 text-white font-semibold">Kaydet</button>
                    <button type="button" onClick={() => setShowSaveInput(false)} className="px-4 py-2 text-sm rounded-md bg-gray-600 hover:bg-gray-500 text-white">İptal</button>
                </div>
            </div>
            ) : (
            <button
                type="button"
                onClick={() => setShowSaveInput(true)}
                disabled={!scenario.trim()}
                className="w-full py-2 px-4 text-sm font-semibold rounded-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-600/50"
            >
                Mevcut Ayarları Preset Olarak Kaydet
            </button>
          )}
          
          {currentResult && (
            <>
                <CameraControlSection 
                    camera={currentResult.diagram.camera}
                    onUpdate={onUpdateCamera}
                />
                {currentResult.diagram?.lights?.length > 0 && 
                    <IndividualLightControlsSection 
                        lights={currentResult.diagram.lights}
                        onUpdate={onUpdateLight}
                    />
                }
                
                <AutoUpdateToggle isEnabled={isAutoUpdateEnabled} onChange={onAutoUpdateChange} />
                
                {!isAutoUpdateEnabled && (
                    <button
                        type="button"
                        onClick={onReconfigure}
                        disabled={isLoading || isReconfiguring}
                        className="w-full py-3 px-4 text-md font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                        bg-green-600 text-white hover:bg-green-500 disabled:bg-green-600/50
                        shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center justify-center gap-3"
                    >
                        {isReconfiguring ? (
                            <>
                                <Spinner size="sm" />
                                Yeniden Yapılandırılıyor...
                            </>
                        ) : (
                            "Yapılandırmayı Güncelle"
                        )}
                    </button>
                )}
            </>
          )}

          {PRESETS.map(preset => (
            <PresetSection 
              key={preset.category}
              preset={preset}
              selectedOptions={selections[preset.category] || []}
              onToggle={(option) => handleToggle(preset.category, option)}
            />
          ))}
        </form>
      </div>
      <div className="mt-auto pt-4">
        <button
          onClick={handleSubmit}
          disabled={isLoading || !scenario.trim()}
          className="w-full py-4 px-6 text-lg font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
            bg-gradient-to-r from-amber-400 to-orange-400 text-purple-950 hover:shadow-lg hover:shadow-amber-500/40
            shadow-md shadow-amber-500/20 flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <Spinner size="sm" className="-ml-1 mr-3 text-white" />
              Oluşturuluyor...
            </>
          ) : (
            "Analiz Et & Görselleştir"
          )}
        </button>
      </div>
    </div>
  );
};

export default PromptControls;