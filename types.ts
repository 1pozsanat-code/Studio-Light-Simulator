export interface DiagramElement {
  x: number;
  y: number;
  label: string;
  type?: string;
  angle?: number;
  intensity?: number; // 0-100
  colorTemperature?: number; // Kelvin
  beamAngle?: number; // degrees
  focalLength?: number; // in mm
}

export interface LightingDiagram {
  model: DiagramElement;
  camera: DiagramElement;
  lights: DiagramElement[];
  backdrop: {
    color: string;
  };
}

export interface LightSetupResult {
  diagram: LightingDiagram;
  analysis: string;
  image_prompt: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  scenario: string;
  result: LightSetupResult;
  imageUrl?: string;
}

export interface Preset {
    category: string;
    options: string[];
}

export interface LightingPreset {
  name: string;
  scenario: string;
  selections: { [key: string]: string[] };
}