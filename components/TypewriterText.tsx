import React, { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
    text: string;
    speed?: number;
    onComplete?: () => void;
    className?: string;
    cursor?: boolean;
    delay?: number;
    playSound?: boolean;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
    text,
    speed = 50,
    onComplete,
    className = "",
    cursor = true,
    delay = 0,
    playSound = true
}) => {
    const [displayedText, setDisplayedText] = useState('');
    const [started, setStarted] = useState(false);
    const indexRef = useRef(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialize Audio Context lazily
    useEffect(() => {
        if (!audioContextRef.current && typeof window !== 'undefined') {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return () => {
            // Cleanup not strictly necessary for singleton context but good practice if we were creating many
        };
    }, []);

    const playClickSound = () => {
        if (!playSound || !audioContextRef.current) return;

        // Resume context if suspended (browser autoplay policy)
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        try {
            const oscillator = audioContextRef.current.createOscillator();
            const gainNode = audioContextRef.current.createGain();

            oscillator.type = 'triangle'; // Softer click than square
            oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContextRef.current.currentTime + 0.01);

            gainNode.gain.setValueAtTime(0.05, audioContextRef.current.currentTime); // Very quiet
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.05);

            oscillator.connect(gainNode);
            gainNode.connect(audioContextRef.current.destination);

            oscillator.start();
            oscillator.stop(audioContextRef.current.currentTime + 0.05);
        } catch (e) {
            console.error("Audio play failed", e);
        }
    };

    useEffect(() => {
        // Reset state when text changes
        setDisplayedText('');
        setStarted(false);
        indexRef.current = 0;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        const startTyping = () => {
            setStarted(true);

            const typeChar = () => {
                if (indexRef.current < text.length) {
                    // Use slice to ensure we get exactly the substring we expect
                    // (index + 1) because slice is end-exclusive
                    const nextCharIndex = indexRef.current + 1;
                    setDisplayedText(text.slice(0, nextCharIndex));
                    indexRef.current = nextCharIndex;

                    if (playSound && text.charAt(nextCharIndex - 1) !== ' ') {
                        playClickSound(); // Only play sound for non-spaces
                    }

                    timeoutRef.current = setTimeout(typeChar, speed);
                } else {
                    if (onComplete) onComplete();
                }
            };

            typeChar();
        };

        if (delay > 0) {
            timeoutRef.current = setTimeout(startTyping, delay);
        } else {
            startTyping();
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [text, speed, delay, onComplete, playSound]);

    return (
        <span className={className}>
            {displayedText}
            {cursor && indexRef.current < text.length && (
                <span className="animate-pulse font-light ml-0.5">|</span>
            )}
        </span>
    );
};

export default TypewriterText;
