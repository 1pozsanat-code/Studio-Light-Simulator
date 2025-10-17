import React from 'react';
import { HistoryEntry } from '../types';

interface HistoryPanelProps {
  history: HistoryEntry[];
  onLoad: (entry: HistoryEntry) => void;
  onClose: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onLoad, onClose }) => {
  return (
    <div className="absolute inset-0 bg-[#1a1625]/80 backdrop-blur-sm z-10 flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">Ayar Geçmişi</h3>
        <button onClick={onClose} className="text-2xl text-gray-400 hover:text-white">&times;</button>
      </div>
      <div className="flex-grow overflow-y-auto pr-2">
        {history.length === 0 ? (
          <p className="text-gray-400 text-center mt-8">Henüz bir analiz yapılmadı.</p>
        ) : (
          <ul className="space-y-3">
            {history.map(entry => (
              <li key={entry.id} className="bg-indigo-900/50 p-3 rounded-lg border border-indigo-800 hover:bg-indigo-900 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-white">{entry.scenario}</p>
                    <p className="text-xs text-gray-400">{entry.timestamp}</p>
                  </div>
                  <button
                    onClick={() => onLoad(entry)}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-purple-900 text-sm font-semibold rounded-md transition-colors flex-shrink-0 ml-4"
                  >
                    Yükle
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;