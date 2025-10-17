import React, { useState, useCallback, useRef } from 'react';
import PromptControls from './PromptControls';
import DisplayArea from './DisplayArea';
import HistoryPanel from './HistoryPanel';
import { LightSetupResult, HistoryEntry, DiagramElement } from '../types';
import { generateLightingSetup, generateSampleImage, reconfigureFromDiagram } from '../services/geminiService';

const Studio: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReconfiguring, setIsReconfiguring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<LightSetupResult | null>(null);
  const [baselineResult, setBaselineResult] = useState<LightSetupResult | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(undefined);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [backdropColor, setBackdropColor] = useState<string>('gray-800');
  const [isGridVisible, setIsGridVisible] = useState<boolean>(true);
  const [isAutoUpdateEnabled, setIsAutoUpdateEnabled] = useState<boolean>(true);
  const [areEffectsVisible, setAreEffectsVisible] = useState<boolean>(true);

  const debounceTimerRef = useRef<number | null>(null);


  const handleGenerate = useCallback(async (scenario: string, selections: { [key: string]: string[] }) => {
    setIsLoading(true);
    setError(null);
    setCurrentResult(null);
    setBaselineResult(null);
    setCurrentImageUrl(undefined);

    try {
      const setupResult = await generateLightingSetup(scenario, selections);
      if (!setupResult) {
        throw new Error("AI could not generate a valid lighting setup.");
      }
      setCurrentResult(setupResult);
      setBaselineResult(setupResult);
      if (setupResult.diagram.backdrop?.color) {
        setBackdropColor(setupResult.diagram.backdrop.color);
      }
      setIsGridVisible(true); // Reset grid on new generation
      setAreEffectsVisible(true); // Reset effects on new generation


      const imageBytes = await generateSampleImage(setupResult.image_prompt);
      let imageUrl: string | undefined = undefined;
      if (imageBytes) {
        imageUrl = `data:image/jpeg;base64,${imageBytes}`;
        setCurrentImageUrl(imageUrl);
      }
      
      const newHistoryEntry: HistoryEntry = {
        id: new Date().toISOString(),
        timestamp: new Date().toLocaleString(),
        scenario,
        result: setupResult,
        imageUrl,
      };
      setHistory(prev => [newHistoryEntry, ...prev]);

    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReconfigure = useCallback(async () => {
    if (!currentResult || !baselineResult) return;
    
    setIsReconfiguring(true);
    setError(null);

    try {
        const reconfigurationResult = await reconfigureFromDiagram(currentResult.diagram, baselineResult);
        if (!reconfigurationResult) {
            throw new Error("AI could not reconfigure the setup.");
        }

        const { analysis, image_prompt } = reconfigurationResult;

        const updatedResult = {
            ...currentResult,
            analysis,
            image_prompt,
        };
        setCurrentResult(updatedResult);
        setBaselineResult(updatedResult); // Update the baseline for the next iteration

        setCurrentImageUrl(undefined); 
        const imageBytes = await generateSampleImage(image_prompt);
        if (imageBytes) {
            const imageUrl = `data:image/jpeg;base64,${imageBytes}`;
            setCurrentImageUrl(imageUrl);
        }

    } catch (err: any) {
        setError(err.message || "An unknown error occurred during reconfiguration.");
    } finally {
        setIsReconfiguring(false);
    }
  }, [currentResult, baselineResult]);

  const debouncedReconfigure = useCallback(() => {
    if (!isAutoUpdateEnabled) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(() => {
        handleReconfigure();
    }, 1000); // 1-second delay
  }, [isAutoUpdateEnabled, handleReconfigure]);


  const loadFromHistory = useCallback((entry: HistoryEntry) => {
    setCurrentResult(entry.result);
    setBaselineResult(entry.result);
    setCurrentImageUrl(entry.imageUrl);
    if (entry.result.diagram.backdrop?.color) {
        setBackdropColor(entry.result.diagram.backdrop.color);
    }
    setIsGridVisible(true);
    setAreEffectsVisible(true);
    setIsHistoryVisible(false);
  }, []);

  const handleUpdateLight = useCallback((lightIndex: number, updates: Partial<DiagramElement>) => {
    setCurrentResult(prevResult => {
      if (!prevResult) return null;

      const newLights = [...prevResult.diagram.lights];
      if (newLights[lightIndex]) {
        newLights[lightIndex] = { ...newLights[lightIndex], ...updates };
      }

      return {
        ...prevResult,
        diagram: {
          ...prevResult.diagram,
          lights: newLights,
        }
      };
    });
    debouncedReconfigure();
  }, [debouncedReconfigure]);

  const handleUpdateCamera = useCallback((updates: Partial<DiagramElement>) => {
    setCurrentResult(prevResult => {
      if (!prevResult) return null;

      const newCamera = { ...prevResult.diagram.camera, ...updates };

      return {
        ...prevResult,
        diagram: {
          ...prevResult.diagram,
          camera: newCamera,
        }
      };
    });
    debouncedReconfigure();
  }, [debouncedReconfigure]);


  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#1a1625] text-gray-200">
      <div className="w-full lg:w-1/3 lg:max-w-md lg:h-screen p-4 overflow-y-auto bg-[#1e192f] border-b lg:border-b-0 lg:border-r border-indigo-900/50">
        <PromptControls 
            onGenerate={handleGenerate} 
            isLoading={isLoading}
            isReconfiguring={isReconfiguring}
            onReconfigure={handleReconfigure}
            currentResult={currentResult}
            onUpdateLight={handleUpdateLight}
            onUpdateCamera={handleUpdateCamera}
            isAutoUpdateEnabled={isAutoUpdateEnabled}
            onAutoUpdateChange={setIsAutoUpdateEnabled}
        />
      </div>
      <div className="w-full lg:flex-1 p-4 flex flex-col relative">
        <div className="absolute top-4 right-4 z-20">
            <button 
              onClick={() => setIsHistoryVisible(prev => !prev)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-md transition-colors shadow-lg shadow-indigo-900/50"
            >
              Geçmiş ({history.length})
            </button>
        </div>
        <DisplayArea 
          result={currentResult} 
          imageUrl={currentImageUrl} 
          isLoading={isLoading || isReconfiguring} 
          error={error}
          backdropColor={backdropColor}
          onBackdropColorChange={setBackdropColor}
          isGridVisible={isGridVisible}
          onGridVisibilityChange={setIsGridVisible}
          areEffectsVisible={areEffectsVisible}
          onEffectsVisibilityChange={setAreEffectsVisible}
          onUpdateLight={handleUpdateLight}
          onUpdateCamera={handleUpdateCamera}
        />
        {isHistoryVisible && (
            <HistoryPanel 
                history={history} 
                onLoad={loadFromHistory} 
                onClose={() => setIsHistoryVisible(false)}
            />
        )}
      </div>
    </div>
  );
};

export default Studio;