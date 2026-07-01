
import React, { useState, useEffect } from 'react';
import { SparklesIcon } from './icons';

const messages = [
  "Consulting the color wheel...",
  "Finding the perfect accessories...",
  "Pairing your perfect outfit...",
  "Tailoring your style advice...",
  "Bringing your look to life...",
];

const LoadingScreen: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-24 w-24 bg-teal-200 rounded-full animate-ping opacity-50"></div>
        <div className="absolute h-16 w-16 bg-orange-200 rounded-full animate-ping opacity-75 delay-75"></div>
        <SparklesIcon className="h-12 w-12 text-teal-600 animate-pulse" />
      </div>
      <h2 className="mt-8 text-3xl font-bold text-teal-800">Aara is styling...</h2>
      <p className="mt-2 text-lg text-orange-600 transition-opacity duration-500">
        {messages[messageIndex]}
      </p>
    </div>
  );
};

export default LoadingScreen;
