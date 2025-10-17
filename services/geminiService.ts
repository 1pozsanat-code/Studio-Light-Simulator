import { GoogleGenAI, Type } from "@google/genai";
import { LightSetupResult, LightingDiagram } from '../types.ts';

// Fix: Per coding guidelines, initialize GoogleGenAI directly with the API key from environment variables, without fallbacks or warnings.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const lightingSetupSchema = {
  type: Type.OBJECT,
  properties: {
    diagram: {
      type: Type.OBJECT,
      properties: {
        model: {
          type: Type.OBJECT,
          properties: {
            x: { type: Type.NUMBER },
            y: { type: Type.NUMBER },
            label: { type: Type.STRING }
          },
          required: ['x', 'y', 'label']
        },
        camera: {
          type: Type.OBJECT,
          properties: {
            x: { type: Type.NUMBER },
            y: { type: Type.NUMBER },
            label: { type: Type.STRING },
            angle: { type: Type.NUMBER, description: "Camera angle from 0 to 360 degrees." },
            focalLength: { type: Type.NUMBER, description: "Camera lens focal length in mm (e.g., 35 for wide, 85 for portrait, 200 for telephoto)." }
          },
          required: ['x', 'y', 'label']
        },
        lights: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER },
              label: { type: Type.STRING },
              type: { type: Type.STRING },
              angle: { type: Type.NUMBER },
              intensity: { type: Type.NUMBER, description: "Light intensity from 0 to 100." },
              colorTemperature: { type: Type.NUMBER, description: "Color temperature in Kelvin (e.g., 3200 for warm, 5500 for neutral)." },
              beamAngle: { type: Type.NUMBER, description: "Beam angle/spread in degrees (e.g., 30 for narrow, 120 for wide)." },
            },
            required: ['x', 'y', 'label', 'type', 'angle', 'intensity', 'colorTemperature', 'beamAngle']
          },
        },
        backdrop: {
          type: Type.OBJECT,
          properties: {
            color: {type: Type.STRING, description: "A hex code or tailwind color like 'gray-800'"}
          },
          required: ['color']
        },
      },
      required: ['model', 'camera', 'lights', 'backdrop']
    },
    analysis: { type: Type.STRING },
    image_prompt: { type: Type.STRING },
  },
  required: ['diagram', 'analysis', 'image_prompt']
};

const reconfigurationSchema = {
    type: Type.OBJECT,
    properties: {
        analysis: { type: Type.STRING },
        image_prompt: { type: Type.STRING },
    },
    required: ['analysis', 'image_prompt']
};


export const generateLightingSetup = async (scenario: string, selections: { [key: string]: string[] }): Promise<LightSetupResult | null> => {
  const model = 'gemini-2.5-pro';

  const selectedOptionsString = Object.entries(selections)
    .filter(([, values]) => values.length > 0)
    .map(([category, values]) => `${category}: ${values.join(', ')}`)
    .join('\n');

  const systemInstruction = `Sen 'Lumi' adında, dünya standartlarında bir AI fotoğraf aydınlatma yönetmenisin. Görevin, kullanıcının senaryosuna göre 2D bir stüdyo aydınlatma düzeni tasarlamaktır.
    - Kullanıcının isteğini ve ekipman seçimlerini analiz et.
    - 2D bir aydınlatma diyagramını temsil eden bir JSON nesnesi oluştur. Stüdyo 100x100'lük bir ızgaradır. Model genellikle merkeze yakındır. Kamera için, senaryoya uygun bir lens odak uzaklığı ('focalLength') öner (ör. portre için 85mm, geniş çekim için 35mm).
    - Her ışık için yoğunluğunu (0-100), renk sıcaklığını (Kelvin) ve ışın açısını (derece) belirt. Renk sıcaklığı için 'Warm' (Sıcak) ~3200K, 'Neutral' (Nötr) ~5500K, 'Cool' (Soğuk) ~7500K'dır. Işın açısı için 'Narrow' (Dar) ışın < 45 derece, 'Wide' (Geniş) > 90 derecedir.
    - Aydınlatmanın etkisi üzerine, yoğunluk ve rengin etkisini de içeren, öz ve uzman bir analizi TÜRKÇE olarak sun.
    - Işık rengini, kalitesini (ör. 'warm, soft light') ve kamera lensini (ör. 'shot on an 85mm lens') belirttiğinden emin olarak, bir AI görüntü oluşturucu için son derece ayrıntılı, sanatsal bir prompt oluştur (bu prompt İngilizce olmalıdır). ÖNEMLİ: Bu görüntü prompt'u, nihai görselde ışık, softbox, kamera veya stand gibi HİÇBİR stüdyo ekipmanının görünmemesi gerektiğini belirtmelidir. Sadece konuya ve aydınlatma etkisine odaklan.
    - Tüm koordinatların (x, y) 0-100 aralığında olduğundan emin ol. Işık ve kamera açıları 0 ile 360 arasında olmalıdır.
    - Işıklar için 'label' 'Ana Işık', 'Dolgu Işığı' gibi olmalıdır. 'type' ise 'Octabox' gibi ekipman olmalıdır.
    - SADECE şemada tanımlanan JSON yapısıyla yanıt ver.`;

  const userPrompt = `
    User Scenario: "${scenario}"
    Selected Equipment & Techniques:
    ${selectedOptionsString}
  `;

  // Fix: Per Gemini API guidelines, separated system instructions from the main prompt.
  const prompt = `Task: Fulfill the following user request based on the rules provided.\n\n${userPrompt}`;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: lightingSetupSchema,
        },
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as LightSetupResult;

  } catch (error) {
    console.error("Error generating lighting setup:", error);
    throw new Error("Failed to generate lighting setup from AI. Check API key and configuration.");
  }
};

export const reconfigureFromDiagram = async (diagram: LightingDiagram, originalResult: { analysis: string, image_prompt: string }): Promise<{ analysis: string, image_prompt: string } | null> => {
    const model = 'gemini-2.5-pro';

    const systemInstruction = `Sen 'Lumi' adında, dünya standartlarında bir AI fotoğraf aydınlatma yönetmenisin. Görevin, sana sağlanan 2D aydınlatma diyagramındaki değişikliklere dayanarak mevcut bir analizi ve görüntü istemini (prompt) GÜNCELLEMEKTİR.
    - Sağlanan JSON'daki her ışığın ve kameranın konumunu, açısını, yoğunluğunu, renk sıcaklığını ve özellikle kameranın 'focalLength' (odak uzaklığı) değerini dikkate al.
    - Orijinal analiz ve görüntü istemi aşağıda verilmiştir.
    - Analizi TÜRKÇE olarak, sadece diyagramdaki değişiklikleri yansıtacak şekilde GÜNCELLE. Değişmeyen kısımları koru.
    - Görüntü istemini (İngilizce olmalıdır) sadece aydınlatma ve kamera değişikliklerinin (odak uzaklığı dahil) etkisini yansıtacak şekilde GÜNCELLE. Konuyu, stili, kompozisyonu veya diğer sanatsal unsurları DEĞİŞTİRME. Amaç, yapılan ince ayarın etkisini A/B testi yapar gibi net bir şekilde göstermektir.
    - ÖNEMLİ: Güncellenmiş görüntü istemi, nihai görselde ışık, softbox, kamera veya stand gibi HİÇBİR stüdyo ekipmanının görünmemesi gerektiğini belirtmelidir.
    - SADECE şemada tanımlanan { "analysis": "...", "image_prompt": "..." } JSON yapısıyla yanıt ver.`;
    
    const userPrompt = `Aşağıdaki orijinal analizi ve prompt'u, bu değiştirilmiş aydınlatma şemasına göre güncelle:

    Original Analysis:
    "${originalResult.analysis}"

    Original Image Prompt:
    "${originalResult.image_prompt}"

    Modified Lighting Diagram:
    ${JSON.stringify(diagram, null, 2)}
    `;

    // Fix: Per Gemini API guidelines, separated system instructions from the main prompt.
    const prompt = `Task: Fulfill the following user request based on the rules provided.\n\n${userPrompt}`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: reconfigurationSchema,
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as { analysis: string, image_prompt: string };

    } catch (error) {
        console.error("Error reconfiguring lighting setup:", error);
        throw new Error("Failed to reconfigure lighting setup from AI.");
    }
};

export const generateSampleImage = async (prompt: string): Promise<string | null> => {
    const model = 'imagen-4.0-generate-001';
    try {
        const response = await ai.models.generateImages({
            model,
            prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '3:4', // The UI has an aspect-[3/4] container for the image.
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        }
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate sample image. The image generation model may be unavailable or the prompt was rejected.");
    }
};
