import React, { useState, useRef, useCallback } from 'react';
import { LightingDiagram as LightingDiagramType, DiagramElement } from '../types';

interface LightingDiagramProps {
  diagram: LightingDiagramType;
  onUpdateLight: (index: number, updates: Partial<DiagramElement>) => void;
  onUpdateCamera: (updates: Partial<DiagramElement>) => void;
  backdropColor?: string;
  isGridVisible?: boolean;
  areEffectsVisible?: boolean;
}

// Helper to determine if a color is light or dark for contrast purposes
const isColorLight = (colorStr: string): boolean => {
    if (colorStr.startsWith('#')) {
        let hex = colorStr.replace('#', '');
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        // Using YIQ formula to determine brightness
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return yiq >= 128;
    }
    // Simple check for tailwind class names
    if (colorStr.includes('white') || colorStr.match(/gray-[1-4]00/)) {
        return true;
    }
    return false;
};


const ModelIcon = ({className}: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const CameraIcon = ({className}: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 6a2 2 0 012-2h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l1.414-1.414a1 1 0 01.707-.293H16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
    <path d="M10 14a3 3 0 100-6 3 3 0 000 6z" />
  </svg>
);

// Helper function for linear interpolation
const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;

// More nuanced color calculation based on temperature, now exposes RGB values
const getDynamicLightProperties = (temp?: number, intensity?: number) => {
    const kelvin = temp ?? 5500;
    const power = intensity ?? 80;

    const warm = { r: 255, g: 160, b: 0 }; // 2000K
    const neutral = { r: 255, g: 255, b: 255 }; // 5500K
    const cool = { r: 170, g: 210, b: 255 }; // 9000K

    let r, g, b;

    if (kelvin <= 5500) {
        const amount = (kelvin - 2000) / (5500 - 2000);
        r = lerp(warm.r, neutral.r, amount);
        g = lerp(warm.g, neutral.g, amount);
        b = lerp(warm.b, neutral.b, amount);
    } else {
        const amount = (kelvin - 5500) / (9000 - 5500);
        r = lerp(neutral.r, cool.r, amount);
        g = lerp(neutral.g, cool.g, amount);
        b = lerp(neutral.b, cool.b, amount);
    }
    
    r = Math.round(Math.max(0, Math.min(255, r)));
    g = Math.round(Math.max(0, Math.min(255, g)));
    b = Math.round(Math.max(0, Math.min(255, b)));

    const glowOpacity = Math.max(0.2, Math.min(0.8, power / 125));
    const glowSpread = Math.max(2, Math.round(power / 12));
    const glowBlur = glowSpread * 2;

    // --- DYNAMIC ANIMATION VALUES ---
    // Pulse duration: faster for more intense lights (e.g., 1.5s to 4s)
    const pulseDuration = lerp(4, 1.5, power / 100);

    // Flicker: more pronounced (lower opacity dip) for warmer lights, and faster for more intense lights
    const flickerOpacity = lerp(0.97, 0.90, Math.max(0, (5500 - kelvin)) / 3500); // from 5500K down to 2000K
    const flickerDuration = lerp(4, 2.5, power / 100);


    return {
        rgb: { r, g, b },
        iconColor: `rgb(${r}, ${g}, ${b})`,
        glowColor: `rgba(${r}, ${g}, ${b}, ${glowOpacity})`,
        glowSpread,
        glowBlur,
        pulseDuration,
        flickerOpacity,
        flickerDuration,
    };
};


const LightIcon = ({type, style}: {type?: string, style: React.CSSProperties}) => {
    let specificIcon;
    const typeLower = type?.toLowerCase() || '';
    if (typeLower.includes('octabox')) {
        specificIcon = <path d="M17.657 6.343L12 2 6.343 6.343 2 12l4.343 5.657L12 22l5.657-4.343L22 12l-4.343-5.657z" />;
    } else if (typeLower.includes('strip')) {
        specificIcon = <path d="M8 4h8v16H8z" />;
    } else if (typeLower.includes('softbox')) {
        specificIcon = <path d="M4 8h16v8H4z" />;
    } else if (typeLower.includes('umbrella')) {
        specificIcon = <path d="M12,2a10,10 0 0 0-10,10h20a10,10 0 0 0-10-10z M12,12v10m-4-2h8" />;
    } else if (typeLower.includes('beauty')) {
        specificIcon = <path d="M12 4a8 8 0 100 16 8 8 0 000-16zm0 2a6 6 0 110 12 6 6 0 010-12z" transform="scale(0.8) translate(2.5, 2.5)"/>;
    } else if (typeLower.includes('snoot')) {
        specificIcon = <path d="M6 4h12L14 20H10L6 4z" />;
    } else if (typeLower.includes('reflector')) {
        specificIcon = <path d="M4 12c0-4.418 3.582-8 8-8s8 3.582 8 8" />;
    }
    else {
        specificIcon = <path d="M12 3v1m0 16v1m9-10h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 6a6 6 0 100 12 6 6 0 000-12z" />;
    }

    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {specificIcon}
      </svg>
    );
};

const LightingDiagram: React.FC<LightingDiagramProps> = ({ diagram, onUpdateLight, onUpdateCamera, areEffectsVisible, ...props }) => {
  const diagramRef = useRef<HTMLDivElement>(null);
  const [interaction, setInteraction] = useState<{
    target: 'light' | 'camera';
    type: 'drag' | 'rotate' | 'beam';
    index?: number; // only for lights
  } | null>(null);

  const handleInteractionMove = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!interaction || !diagramRef.current) return;

    const rect = diagramRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPercent = Math.max(0, Math.min(100, (mouseX / rect.width) * 100));
    const yPercent = Math.max(0, Math.min(100, (mouseY / rect.height) * 100));

    if (interaction.target === 'camera') {
        const camera = diagram.camera;
        const cameraXPixels = (camera.x / 100) * rect.width;
        const cameraYPixels = (camera.y / 100) * rect.height;

        if (interaction.type === 'drag') {
            onUpdateCamera({ x: xPercent, y: yPercent });
        } else if (interaction.type === 'rotate') {
            const dx = mouseX - cameraXPixels;
            const dy = mouseY - cameraYPixels;
            const angle = (Math.atan2(dy, dx) * (180 / Math.PI)) + 90;
            onUpdateCamera({ angle: Math.round((angle + 360) % 360) });
        }
    } else if (interaction.target === 'light' && interaction.index !== undefined) {
        const light = diagram.lights[interaction.index];
        const lightXPixels = (light.x / 100) * rect.width;
        const lightYPixels = (light.y / 100) * rect.height;

        switch (interaction.type) {
        case 'drag':
            onUpdateLight(interaction.index, { x: xPercent, y: yPercent });
            break;
        case 'rotate':
            const dx = mouseX - lightXPixels;
            const dy = mouseY - lightYPixels;
            const angle = (Math.atan2(dy, dx) * (180 / Math.PI)) + 90;
            onUpdateLight(interaction.index, { angle: Math.round((angle + 360) % 360) });
            break;
        case 'beam':
            const lightAngleRad = ((light.angle || 0) - 90) * (Math.PI / 180);
            const mouseAngleRad = Math.atan2(mouseY - lightYPixels, mouseX - lightXPixels);
            let angleDiff = mouseAngleRad - lightAngleRad;
            angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
            const newBeamAngle = Math.max(10, Math.min(180, Math.abs(angleDiff) * (180 / Math.PI) * 2));
            onUpdateLight(interaction.index, { beamAngle: Math.round(newBeamAngle) });
            break;
        }
    }
  }, [interaction, diagram, onUpdateLight, onUpdateCamera]);

  const handleInteractionEnd = useCallback(() => {
    setInteraction(null);
  }, []);

  const handleInteractionStart = (
    target: 'light' | 'camera',
    type: 'drag' | 'rotate' | 'beam',
    index?: number
  ) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setInteraction({ target, type, index });
  };
  
  if (!diagram || !diagram.model || !diagram.camera || !diagram.lights) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-md">
        <p className="text-gray-500">Diyagram verileri yüklenemedi.</p>
      </div>
    );
  }

  const { model, camera, lights } = diagram;
  
  const finalBackdropColor = props.backdropColor ?? diagram.backdrop?.color ?? 'gray-800';
  const finalGridVisible = props.isGridVisible ?? true;
  const finalEffectsVisible = areEffectsVisible ?? true;
  const isLightBackdrop = isColorLight(finalBackdropColor);
  
  const textShadowStyle = { textShadow: '0 1px 3px rgba(0,0,0,0.6)' };

  const modelIconColor = isLightBackdrop ? 'text-gray-900' : 'text-white';
  const modelLabelColor = isLightBackdrop ? 'text-gray-800 font-medium' : 'text-white';
  const cameraIconColor = isLightBackdrop ? 'text-blue-700' : 'text-blue-400';
  const cameraLabelColor = isLightBackdrop ? 'text-blue-800 font-medium' : 'text-blue-300';
  const cameraDetailsColor = isLightBackdrop ? 'text-blue-700' : 'text-blue-400';
  const lightLabelColor = isLightBackdrop ? 'text-orange-600' : 'text-amber-200';
  const lightTypeColor = isLightBackdrop ? 'text-orange-700/80' : 'text-amber-400/70';
  const lightDetailsColor = isLightBackdrop ? 'text-gray-600' : 'text-gray-400';

  const backdropClass = finalBackdropColor.startsWith('#') ? '' : `bg-${finalBackdropColor}`;
  const backdropBaseStyle = finalBackdropColor.startsWith('#') ? { backgroundColor: finalBackdropColor } : {};
  const gridClass = finalGridVisible ? 'studio-background-grid' : '';
  
  const lightGridStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.08) 1px, transparent 1px)`,
    backgroundSize: '2rem 2rem'
  }
  
  const getCursor = () => {
      if (!interaction) return 'default';
      if (interaction.type === 'drag') return 'grabbing';
      if (interaction.type === 'rotate') return 'crosshair'; // Better rotate cursors are hard
      if (interaction.type === 'beam') return 'ew-resize';
      return 'grabbing';
  }

  return (
    <div className="w-full h-full relative rounded-md overflow-hidden studio-vignette select-none"
      ref={diagramRef}
      onMouseMove={handleInteractionMove}
      onMouseUp={handleInteractionEnd}
      onMouseLeave={handleInteractionEnd}
      style={{ cursor: getCursor() }}
    >
      <div 
        className={`w-full h-full ${backdropClass} ${isLightBackdrop ? '' : gridClass}`} 
        style={ isLightBackdrop && finalGridVisible ? { ...backdropBaseStyle, ...lightGridStyle } : backdropBaseStyle}
      >
        <div className="absolute flex flex-col items-center text-center pointer-events-none" style={{ left: `${model.x}%`, top: `${model.y}%`, transform: 'translate(-50%, -50%)' }}>
            <ModelIcon className={modelIconColor} />
            <span className={`text-xs mt-1 ${modelLabelColor}`} style={textShadowStyle}>{model.label}</span>
        </div>

        <div className="absolute group" style={{ left: `${camera.x}%`, top: `${camera.y}%`, transform: 'translate(-50%, -50%)', zIndex: interaction?.target === 'camera' ? 10 : 1 }}>
            <div className="relative w-6 h-6">
                <div 
                    className="absolute inset-0 cursor-grab"
                    onMouseDown={handleInteractionStart('camera', 'drag')}
                >
                    <div 
                        className="relative h-6 w-6"
                        style={{ transform: `rotate(${camera.angle || 0}deg)` }}
                    >
                        <CameraIcon className={cameraIconColor} />
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2" style={{width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: `6px solid ${isLightBackdrop ? '#1e40af' : '#60a5fa'}`}} aria-hidden="true"></div>
                    </div>
                </div>
            </div>

            <div className="text-center pointer-events-none" style={{ paddingTop: '1.75rem' }}>
                <span className={`text-xs block ${cameraLabelColor}`} style={textShadowStyle}>{camera.label}</span>
                {camera.focalLength && <span className={`text-xs block ${cameraDetailsColor}`} style={textShadowStyle}>{camera.focalLength}mm</span>}
            </div>
            
            {/* INTERACTIVE HANDLES for CAMERA */}
            <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity">
                <div 
                    onMouseDown={handleInteractionStart('camera', 'rotate')} 
                    className="absolute w-3 h-3 bg-blue-400 rounded-full border-2 border-white cursor-crosshair" 
                    style={{
                        left: `calc(50% + ${28 * Math.cos(((camera.angle || 0) - 90) * (Math.PI / 180))}px)`, 
                        top: `calc(50% + ${28 * Math.sin(((camera.angle || 0) - 90) * (Math.PI / 180))}px)`, 
                        transform: `translate(-50%, -50%)`
                    }} 
                />
            </div>
        </div>


        {lights.map((light, index) => {
            const { rgb, iconColor, glowColor, glowSpread, glowBlur, pulseDuration, flickerOpacity, flickerDuration } = getDynamicLightProperties(light.colorTemperature, light.intensity);
            
            const containerStyle: React.CSSProperties = { left: `${light.x}%`, top: `${light.y}%`, transform: 'translate(-50%, -50%)', zIndex: (interaction?.target === 'light' && interaction?.index === index) ? 10 : 1};
            const iconWrapperStyle: React.CSSProperties = {
                ...({
                    '--flicker-opacity': flickerOpacity,
                } as React.CSSProperties),
                boxShadow: `0 0 ${glowBlur}px ${glowSpread}px ${glowColor}`,
                borderRadius: '9999px',
                animation: `pulse ${pulseDuration}s ease-in-out infinite, flicker ${flickerDuration}s ease-in-out infinite`,
            };
            const beamAngle = light.beamAngle || 90;
            const intensity = light.intensity || 80;
            const beamLength = 30 + intensity * 0.9;
            const baseOpacity = Math.max(0.2, Math.min(0.9, intensity / 110));
            const halfAngleRad = (beamAngle / 2) * (Math.PI / 180);
            const endX1 = beamLength * Math.sin(-halfAngleRad);
            const endY1 = -beamLength * Math.cos(-halfAngleRad);
            const endX2 = beamLength * Math.sin(halfAngleRad);
            const endY2 = -beamLength * Math.cos(halfAngleRad);
            const largeArcFlag = beamAngle > 180 ? 1 : 0;
            const beamPath = `M 0,0 L ${endX1},${endY1} A ${beamLength},${beamLength} 0 ${largeArcFlag} 1 ${endX2},${endY2} Z`;

            // Handle positions
            const rotationHandleDistance = 28;
            const rotationHandleAngleRad = ((light.angle || 0) - 90) * (Math.PI / 180);
            const rotHandleX = rotationHandleDistance * Math.cos(rotationHandleAngleRad);
            const rotHandleY = rotationHandleDistance * Math.sin(rotationHandleAngleRad);
            
            const beamHandleDistance = beamLength * 0.9;
            const lightDirectionRad = ((light.angle || 0) - 90) * (Math.PI / 180);
            const beamHandleAngleRad = (light.beamAngle || 90) / 2 * (Math.PI / 180);
            const beamHandle1X = beamHandleDistance * Math.cos(lightDirectionRad - beamHandleAngleRad);
            const beamHandle1Y = beamHandleDistance * Math.sin(lightDirectionRad - beamHandleAngleRad);
            const beamHandle2X = beamHandleDistance * Math.cos(lightDirectionRad + beamHandleAngleRad);
            const beamHandle2Y = beamHandleDistance * Math.sin(lightDirectionRad + beamHandleAngleRad);


            return (
            <div key={index} className="absolute group" style={containerStyle}>
                {finalEffectsVisible && (
                    <div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" 
                        style={{
                            width: beamLength * 2, 
                            height: beamLength * 2, 
                            transform: `rotate(${light.angle || 0}deg)`,
                            clipPath: `path('${beamPath}')`
                        }}
                    >
                        <svg width="100%" height="100%" viewBox={`-${beamLength} -${beamLength} ${beamLength * 2} ${beamLength * 2}`} className="opacity-80" style={{ overflow: 'visible' }}>
                            <defs>
                                <radialGradient id={`effect-grad-${index}`} cx="0" cy="0" r={beamLength} gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor={`rgba(${rgb.r},${rgb.g},${rgb.b},1)`} />
                                    <stop offset="100%" stopColor={`rgba(${rgb.r},${rgb.g},${rgb.b},0)`} />
                                </radialGradient>
                                <filter id={`dust-motes-filter-${index}`}>
                                    <feTurbulence type="fractalNoise" baseFrequency="0.2" numOctaves="1" result="turbulence"/>
                                    <feGaussianBlur stdDeviation="1" />
                                </filter>
                            </defs>
                            {/* Main Haze Layer */}
                            <rect
                                x={-beamLength}
                                y={-beamLength}
                                width={beamLength * 2}
                                height={beamLength * 2}
                                fill={`url(#effect-grad-${index})`}
                                style={{
                                    ...({
                                        '--shimmer-start-opacity': baseOpacity * 0.3,
                                        '--shimmer-end-opacity': baseOpacity * 0.5,
                                    } as React.CSSProperties),
                                    animation: `light-shimmer ${lerp(6, 3, intensity / 100)}s ease-in-out infinite`,
                                    filter: 'blur(5px)',
                                }}
                            />
                            {/* Dust Motes Layer */}
                            <rect
                                x={-beamLength}
                                y={-beamLength}
                                width={beamLength * 2}
                                height={beamLength * 2 + 50} // Taller for animation
                                fill="white"
                                filter={`url(#dust-motes-filter-${index})`}
                                style={{
                                    opacity: baseOpacity * 0.08,
                                    animation: `dust-motes ${lerp(10, 5, intensity / 100)}s linear infinite`,
                                }}
                            />
                        </svg>
                    </div>
                )}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{width: beamLength * 2, height: beamLength * 2, transform: `rotate(${light.angle || 0}deg)`}}>
                    <svg width="100%" height="100%" viewBox={`-${beamLength} -${beamLength} ${beamLength * 2} ${beamLength * 2}`} className="opacity-80 group-hover:opacity-100 transition-opacity duration-300" style={{ overflow: 'visible' }}>
                        <defs>
                            <radialGradient id={`grad-${index}`} cx="0" cy="0" r={beamLength} gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor={`rgba(${rgb.r},${rgb.g},${rgb.b},${baseOpacity * 0.7})`} />
                                <stop offset="25%" stopColor={`rgba(${rgb.r},${rgb.g},${rgb.b},${baseOpacity * 0.4})`} />
                                <stop offset="75%" stopColor={`rgba(${rgb.r},${rgb.g},${rgb.b},${baseOpacity * 0.1})`} />
                                <stop offset="100%" stopColor={`rgba(${rgb.r},${rgb.g},${rgb.b},0)`} />
                            </radialGradient>
                        </defs>
                        <path d={beamPath} fill={`url(#grad-${index})`} />
                    </svg>
                </div>
                <div style={iconWrapperStyle} className="absolute inset-0 cursor-grab" onMouseDown={handleInteractionStart('light', 'drag', index)}>
                    <div className="relative h-6 w-6" style={{ transform: `rotate(${light.angle || 0}deg)` }}>
                        <LightIcon type={light.type} style={{ color: iconColor }} />
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2" style={{width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: `6px solid ${iconColor}`, opacity: 0.8}} aria-hidden="true"></div>
                    </div>
                </div>
                <div className="text-center pointer-events-none" style={{paddingTop: '1.75rem'}}>
                    <span className={`text-xs block ${lightLabelColor}`} style={textShadowStyle}>{light.label}</span>
                    <span className={`text-xs block ${lightTypeColor}`} style={textShadowStyle}>{light.type}</span>
                    {(light.colorTemperature || light.beamAngle) && (
                    <div className={`text-xs mt-0.5 flex gap-2 justify-center ${lightDetailsColor}`} style={textShadowStyle}>
                        {light.colorTemperature && <span>{light.colorTemperature}K</span>}
                        {light.beamAngle && <span>{light.beamAngle}°</span>}
                    </div>
                    )}
                </div>
                {/* INTERACTIVE HANDLES */}
                <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <div onMouseDown={handleInteractionStart('light', 'rotate', index)} className="absolute w-3 h-3 bg-blue-400 rounded-full border-2 border-white cursor-crosshair" style={{left: `calc(50% + ${rotHandleX}px)`, top: `calc(50% + ${rotHandleY}px)`, transform: `translate(-50%, -50%)`}} />
                    <div onMouseDown={handleInteractionStart('light', 'beam', index)} className="absolute w-3 h-3 bg-green-400 rounded-full border-2 border-white cursor-ew-resize" style={{left: `calc(50% + ${beamHandle1X}px)`, top: `calc(50% + ${beamHandle1Y}px)`, transform: `translate(-50%, -50%)`}} />
                    <div onMouseDown={handleInteractionStart('light', 'beam', index)} className="absolute w-3 h-3 bg-green-400 rounded-full border-2 border-white cursor-ew-resize" style={{left: `calc(50% + ${beamHandle2X}px)`, top: `calc(50% + ${beamHandle2Y}px)`, transform: `translate(-50%, -50%)`}} />
                </div>
            </div>
            );
        })}
      </div>
    </div>
  );
};

export default LightingDiagram;