import { Preset, LightingPreset } from './types';

export const PRESETS: Preset[] = [
  {
    category: 'Ana Işık Kaynakları',
    options: ['Strobe Light', 'Continuous LED Panel', 'Speedlight', 'HMI Light'],
  },
  {
    category: 'Işık Şekillendiriciler',
    options: ['Softbox', 'Octabox', 'Beauty Dish', 'Umbrella', 'Stripbox', 'Snoot', 'Grid', 'Reflector Panel', 'Parabolic Reflector'],
  },
  {
    category: 'Yardımcı Işıklar',
    options: ['Rim Light', 'Hair Light', 'Background Light', 'Kicker Light'],
  },
  {
    category: 'Aksesuarlar',
    options: ['Gobo', 'Color Gels', 'V-Flat', 'Flag', 'Diffuser Panel', 'Barn Doors'],
  },
  {
    category: 'Aydınlatma Teknikleri',
    options: ['Rembrandt Lighting', 'Butterfly Lighting', 'Split Lighting', 'Loop Lighting', 'Clamshell Lighting', 'High-Key', 'Low-Key', 'Cross Lighting'],
  },
];

export const LIGHTING_PRESETS: LightingPreset[] = [
  {
    name: 'Klasik Portre',
    scenario: 'Klasik, yumuşak ışıklı bir stüdyo portresi',
    selections: {
      'Ana Işık Kaynakları': ['Strobe Light'],
      'Işık Şekillendiriciler': ['Octabox', 'Reflector Panel'],
      'Yardımcı Işıklar': ['Hair Light'],
      'Aydınlatma Teknikleri': ['Rembrandt Lighting'],
    },
  },
  {
    name: 'Dramatik Portre',
    scenario: 'Dramatik, düşük ışıklı ve sert gölgeli bir erkek portresi',
    selections: {
      'Ana Işık Kaynakları': ['Strobe Light'],
      'Işık Şekillendiriciler': ['Beauty Dish', 'Grid'],
      'Yardımcı Işıklar': ['Kicker Light'],
      'Aydınlatma Teknikleri': ['Split Lighting', 'Low-Key'],
    },
  },
  {
    name: 'Ürün Çekimi',
    scenario: 'Beyaz arka plan üzerinde temiz, parlak ve modern bir ürün fotoğrafı',
    selections: {
      'Ana Işık Kaynakları': ['Continuous LED Panel'],
      'Işık Şekillendiriciler': ['Softbox', 'Stripbox', 'Reflector Panel'],
      'Yardımcı Işıklar': ['Background Light'],
      'Aydınlatma Teknikleri': ['High-Key'],
    },
  },
  {
    name: 'Moda Çekimi',
    scenario: 'Yüksek enerjili, tam boy bir moda çekimi',
    selections: {
      'Ana Işık Kaynakları': ['Strobe Light'],
      'Işık Şekillendiriciler': ['Beauty Dish', 'Parabolic Reflector'],
      'Aksesuarlar': ['V-Flat'],
      'Aydınlatma Teknikleri': ['Butterfly Lighting'],
    },
  },
];
