import React, { useState, useEffect } from 'react';

export default function TypewriterText({ text, delay = 20, onComplete }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset if text changes
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
      
      return () => clearTimeout(timeout);
    } else if (onComplete && currentIndex === text.length) {
      // Fire onComplete when done
      onComplete();
    }
  }, [currentIndex, text, delay, onComplete]);

  return (
    <span>
      {displayedText}
      {currentIndex < text.length && (
        <span className="typewriter-cursor">|</span>
      )}
    </span>
  );
}
