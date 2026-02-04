import React from 'react';

const PreviewModeBanner: React.FC = () => {
    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 py-3 shadow-lg">
            <div className="max-w-6xl mx-auto flex items-center justify-center gap-3">
                <span className="text-2xl">🚧</span>
                <div>
                    <h3 className="font-bold text-lg inline-block mr-2">Preview Mode</h3>
                    <span className="text-sm opacity-90 font-medium">Timers are simulated (10s) for testing purposes. Status: Demo.</span>
                </div>
            </div>
        </div>
    );
};

export default PreviewModeBanner;
