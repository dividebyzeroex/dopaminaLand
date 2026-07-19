'use client';

import { useState, useEffect, useCallback } from 'react';

const LINES = [
  'Bem-vindo ao Dopamina.',
  'Aqui nada é real.',
  'Exceto a dopamina.',
];

export default function CinematicIntro() {
  const [hasSeenIntro, setHasSeenIntro] = useState(true); // default true to prevent flash
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showGlitch, setShowGlitch] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem('dopamina-intro-seen');
      if (!seen) {
        setHasSeenIntro(false);
        document.body.style.overflow = 'hidden';
      }
    } catch {}
  }, []);

  const typeText = useCallback((text: string, onComplete: () => void) => {
    setIsTyping(true);
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
        onComplete();
      }
    }, 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (hasSeenIntro) return;

    const timer = setTimeout(() => {
      runSequence();
    }, 800);

    return () => clearTimeout(timer);
  }, [hasSeenIntro]);

  const runSequence = () => {
    // Line 0
    setCurrentLine(0);
    const cleanup0 = typeText(LINES[0], () => {
      setTimeout(() => {
        // Line 1 with glitch
        setShowGlitch(true);
        setTimeout(() => setShowGlitch(false), 200);
        setCurrentLine(1);
        typeText(LINES[1], () => {
          setTimeout(() => {
            // Line 2
            setShowGlitch(true);
            setTimeout(() => setShowGlitch(false), 150);
            setCurrentLine(2);
            typeText(LINES[2], () => {
              setTimeout(() => {
                finishIntro();
              }, 1500);
            });
          }, 1200);
        });
      }, 1500);
    });
  };

  const finishIntro = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      try { localStorage.setItem('dopamina-intro-seen', 'true'); } catch {}
      setHasSeenIntro(true);
      document.body.style.overflow = '';
    }, 800);
  };

  const handleSkip = () => {
    finishIntro();
  };

  if (hasSeenIntro) return null;

  return (
    <div
      className={`fixed inset-0 z-[10001] flex flex-col items-center justify-center bg-black transition-opacity duration-700 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Glitch flash */}
      {showGlitch && (
        <div className="absolute inset-0 bg-neon/5 mix-blend-screen" />
      )}

      {/* Text */}
      <div className="text-center px-8 max-w-2xl">
        <h1
          className={`font-[var(--font-display)] text-3xl sm:text-5xl md:text-6xl font-black tracking-tight transition-all duration-300 ${
            currentLine === 2 ? 'text-neon animate-neon-flicker' : 'text-white'
          }`}
        >
          {displayedText}
          {isTyping && (
            <span className="inline-block w-[3px] h-[1em] bg-neon ml-1 align-text-bottom" style={{ animation: 'blink-caret 0.75s step-end infinite' }} />
          )}
        </h1>
      </div>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute bottom-8 right-8 text-white/30 text-xs font-medium hover:text-white/60 transition"
      >
        pular intro →
      </button>

      {/* Subtle particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-neon/20"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
