import React from 'react';
import Logo from './Logo';

interface LandingPageProps {
  onEnter: () => void;
}

// Fix: Changed JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
const InstructionCard: React.FC<{ icon: React.ReactElement, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="flex flex-col items-center text-center p-4">
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500/50 text-amber-300 mb-4 border border-indigo-400/50">
      {icon}
    </div>
    <h3 className="font-semibold text-white">{title}</h3>
    <p className="text-sm text-gray-400">{description}</p>
  </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gradient-to-b from-[#1a1625] to-[#14111d] overflow-hidden">
      <div className="absolute inset-0 studio-background-grid bg-center [mask-image:radial-gradient(ellipse_at_center,white_20%,transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(40,28,59,0.5)_0%,transparent_80%)]"></div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="p-4 bg-black/30 rounded-full backdrop-blur-sm mb-6 animate-[subtle-glow_4s_ease-in-out_infinite]">
          <Logo className="h-24 w-24" />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
          Stüdyo Mustafa Yağcı
        </h1>
        <p className="mt-4 text-2xl text-amber-400 font-light tracking-wider">
          Işık Herşeydir
        </p>

        <div className="mt-12 max-w-4xl w-full bg-black/20 p-6 rounded-2xl backdrop-blur-lg border border-white/10 shadow-2xl shadow-purple-900/20">
          <h2 className="text-xl font-semibold text-white mb-4">Stüdyo Deneyiminiz Başlıyor</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
            <InstructionCard 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}
              title="1. Senaryo Oluşturun"
              description='Çekim vizyonunuzu tanımlayın (ör: "Dramatik bir portre").'
            />
            <InstructionCard 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 16v-2m8-8h-2M4 12H2m15.364 6.364l-1.414-1.414M6.343 6.343L4.929 4.929m12.728 0l-1.414 1.414M6.343 17.657l1.414-1.414" /></svg>}
              title="2. Ekipman Seçin"
              description="Presetleri kullanarak ışık kaynaklarını ve şekillendiricileri seçin."
            />
            <InstructionCard 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
              title="3. Analiz Edin & Görselleştirin"
              description="AI'nin 2D şema, analiz ve örnek görsel oluşturmasını izleyin."
            />
          </div>
        </div>

        <button
          onClick={onEnter}
          className="group relative mt-12 px-10 py-4 bg-gradient-to-r from-amber-400 to-orange-400 text-purple-950 font-bold text-lg rounded-full transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-amber-500/30 hover:shadow-amber-400/50"
        >
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500"></span>
          <span className="relative">Stüdyoya Giriş Yap</span>
        </button>
      </div>
    </div>
  );
};

export default LandingPage;