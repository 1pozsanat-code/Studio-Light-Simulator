import React, { useState } from 'react';
import LandingPage from './components/LandingPage.tsx';
import Studio from './components/Studio.tsx';

const App: React.FC = () => {
  const [showStudio, setShowStudio] = useState(false);

  const enterStudio = () => {
    setShowStudio(true);
  };

  return (
    <div className="bg-[#1a1625] text-white min-h-screen">
      {showStudio ? <Studio /> : <LandingPage onEnter={enterStudio} />}
    </div>
  );
};

export default App;