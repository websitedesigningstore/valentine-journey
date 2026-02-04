import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserConfig } from '../../services/storage';
import { ValentineConfig, Confession } from '../../types';
import ConfessionRenderer from '../../components/ConfessionRenderer';

const FinishedPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [config, setConfig] = useState<ValentineConfig | null>(null);

  useEffect(() => {
    const fetchMemories = async () => {
      if (userId) {
        const data = await getUserConfig(userId);
        setConfig(data);
      }
    };
    fetchMemories();
  }, [userId]);

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-b from-rose-50 to-pink-100">
      <div className="max-w-md w-full text-center mb-8 pt-10">
        <h1 className="text-4xl font-hand font-bold text-rose-600 mb-2 drop-shadow-sm">Love Gallery 📸</h1>
        <p className="text-gray-600 italic">Our beautiful journey together...</p>
      </div>

      {config?.confessions && config.confessions.length > 0 ? (
        <div className="w-full max-w-md space-y-6 pb-20">
          {config.confessions.map((item, index) => (
            <div key={index} className="glass-card p-6 rounded-2xl border border-rose-200 shadow-md bg-white/80 transform hover:scale-[1.02] transition-all">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">{item.day.toUpperCase()}</span>
                <span className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString()}</span>
              </div>

              <ConfessionRenderer day={item.day} text={item.text} />
            </div>
          ))}

          <div className="text-center mt-10">
            <div className="text-6xl animate-pulse">💑</div>
            <p className="mt-4 text-rose-800 font-bold">To be continued...</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-500">Collecting memories... ✨</p>
          <p className="text-xs text-gray-400 mt-2">(Confessions will appear here)</p>
        </div>
      )}
    </div>
  );
};

export default FinishedPage;
