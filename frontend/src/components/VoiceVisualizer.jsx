import React from 'react';
import { motion } from 'framer-motion';

const VoiceVisualizer = ({ count = 15, color = "rgba(77, 75, 236, 0.85)" }) => {
    return (
        <div className="flex items-end justify-center gap-1 h-12 mb-6">
            {[...Array(count)].map((_, i) => (
                <motion.div
                    key={i}
                    className="w-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                    animate={{
                        height: [
                            `${20 + Math.random() * 40}%`,
                            `${60 + Math.random() * 40}%`,
                            `${30 + Math.random() * 30}%`,
                            `${70 + Math.random() * 30}%`,
                            `${20 + Math.random() * 40}%`
                        ]
                    }}
                    transition={{
                        duration: 1 + Math.random(),
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.05
                    }}
                />
            ))}
        </div>
    );
};

export default VoiceVisualizer;
