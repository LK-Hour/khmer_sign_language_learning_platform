'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Confetto {
  id: number;
  left: number;
  delay: number;
  duration: number;
  rotation: number;
}

export interface ConfettiAnimationProps {
  /**
   * Whether to show the confetti
   */
  isActive?: boolean;
  /**
   * Number of confetti pieces (default: 50)
   */
  count?: number;
  /**
   * Duration of animation in seconds (default: 3)
   */
  duration?: number;
}

/**
 * Confetti animation using Framer Motion
 * Displays celebratory confetti when a lesson/quiz is completed
 */
export function ConfettiAnimation({
  isActive = true,
  count = 50,
  duration = 3,
}: ConfettiAnimationProps): JSX.Element | null {
  const [confetti, setConfetti] = useState<Confetto[]>([]);

  useEffect(() => {
    if (!isActive) {
      setConfetti([]);
      return;
    }

    // Generate random confetti pieces
    const pieces: Confetto[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.3,
      duration: duration + Math.random() * 0.5,
      rotation: Math.random() * 360,
    }));

    setConfetti(pieces);
  }, [isActive, count, duration]);

  if (!isActive || confetti.length === 0) {
    return null;
  }

  const colors = ['#C0392B', '#F1C40F', '#2980B9', '#E74C3C', '#F39C12'];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            y: -20,
            opacity: 1,
            rotate: piece.rotation,
          }}
          animate={{
            y: window.innerHeight + 20,
            opacity: 0,
            rotate: piece.rotation + 360,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'easeIn',
          }}
          style={{
            position: 'absolute',
            left: `${piece.left}%`,
            top: 0,
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              backgroundColor: colors[piece.id % colors.length],
              borderRadius: '2px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
