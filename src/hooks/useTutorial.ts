import { useState, useEffect } from 'react';

export const useTutorial = () => {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('quantize-tutorial-seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const completeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('quantize-tutorial-seen', 'true');
  };

  const resetTutorial = () => {
    localStorage.removeItem('quantize-tutorial-seen');
    setShowTutorial(true);
  };

  return {
    showTutorial,
    completeTutorial,
    resetTutorial,
  };
};
