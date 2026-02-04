import React, { useRef, useEffect, useState } from 'react';

interface ScratchCardProps {
    width: number;
    height: number;
    image?: string;
    onReveal?: () => void;
    children: React.ReactNode;
}

const ScratchCard: React.FC<ScratchCardProps> = ({ width, height, image, onReveal, children }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (image) {
            const img = new Image();
            img.src = image;
            img.onload = () => {
                ctx.drawImage(img, 0, 0, width, height);
            };
        } else {
            // Default Gradient Fill (Gold/Silver)
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#e5e7eb'); // gray-200
            gradient.addColorStop(0.5, '#9ca3af'); // gray-400
            gradient.addColorStop(1, '#e5e7eb'); // gray-200
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Add some text hint
            ctx.font = "bold 20px Arial";
            ctx.fillStyle = "#4b5563";
            ctx.textAlign = "center";
            ctx.fillText("Scratch Here!", width / 2, height / 2);
        }
    }, [image, width, height]);

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (isRevealed || !isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, 2 * Math.PI);
        ctx.fill();

        checkReveal();
    };

    const checkReveal = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const imageData = ctx.getImageData(0, 0, width, height);
        let transparent = 0;
        for (let i = 3; i < imageData.data.length; i += 4) {
            if (imageData.data[i] === 0) transparent++;
        }

        const percentage = (transparent / (width * height)) * 100;
        if (percentage > 50) {
            setIsRevealed(true);
            if (onReveal) onReveal();
        }
    };

    return (
        <div className="relative" style={{ width, height }}>
            {/* Content to be revealed */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
                {children}
            </div>

            {/* Scratch Layer */}
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                onMouseDown={() => setIsDrawing(true)}
                onMouseUp={() => setIsDrawing(false)}
                onMouseMove={handleMouseMove}
                onTouchStart={() => setIsDrawing(true)}
                onTouchEnd={() => setIsDrawing(false)}
                onTouchMove={handleMouseMove}
                className={`absolute inset-0 z-10 touch-none transition-opacity duration-700 ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100 cursor-cell'}`}
            />
        </div>
    );
};

export default ScratchCard;
