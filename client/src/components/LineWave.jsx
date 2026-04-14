import React, { useEffect, useRef, useState } from 'react';

const LineWave = () => {
    const [time, setTime] = useState(0);
    const requestRef = useRef();

    const animate = (t) => {
        setTime(t / 1000);
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const generatePath = (offset, amplitude, frequency) => {
        const width = window.innerWidth;
        const height = 400;
        const points = [];
        const step = 15;

        for (let x = 0; x <= width + step; x += step) {
            // Subtract time from x phase to move right-to-left
            let y = height / 2 + Math.sin(x * frequency - time * 2 + offset) * amplitude;
            points.push(`${x},${y}`);
        }

        return `M ${points.join(' L ')}`;
    };

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-20 opacity-60">
            <svg
                width="100%"
                height="100%"
                className="w-full h-full"
            >
                <path
                    d={generatePath(0, 35, 0.005)}
                    stroke="url(#grad1)"
                    strokeWidth="3"
                    fill="none"
                />
                <path
                    d={generatePath(Math.PI, 25, 0.008)}
                    stroke="url(#grad2)"
                    strokeWidth="2"
                    fill="none"
                />
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(109, 40, 217, 0)" />
                        <stop offset="50%" stopColor="rgba(109, 40, 217, 0.8)" />
                        <stop offset="100%" stopColor="rgba(109, 40, 217, 0)" />
                    </linearGradient>
                    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(37, 99, 235, 0)" />
                        <stop offset="50%" stopColor="rgba(37, 99, 235, 0.7)" />
                        <stop offset="100%" stopColor="rgba(37, 99, 235, 0)" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

export default LineWave;
