import React, { useState } from 'react';

interface OnboardingNameScreenProps {
  onNameSubmit: (name: string) => void;
}

const OnboardingNameScreen: React.FC<OnboardingNameScreenProps> = ({ onNameSubmit }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSubmit(name.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-fade-in">
      <div className="bg-white/70 backdrop-blur-md p-8 md:p-12 rounded-2xl shadow-lg border border-orange-100 max-w-lg w-full">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-teal-800 tracking-wider font-[Georgia,serif]">
          Aara
        </h1>
        <p className="mt-4 text-base sm:text-lg text-stone-600">
          Welcome! I'm your personal AI stylist. What should I call you?
        </p>
        <form onSubmit={handleSubmit} className="mt-8">
          <input
            type="text"
            id="username"
            name="username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full p-4 border border-orange-200 rounded-lg bg-white/50 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition text-lg text-center"
            autoFocus
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="mt-6 w-full bg-teal-600 text-white font-bold py-4 px-12 rounded-full text-lg hover:bg-teal-700 transition-colors duration-300 transform hover:scale-105 shadow-md disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
          >
            Next
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingNameScreen;