import React from 'react';
import { OutfitIcon } from './icons';

interface OnboardingReadyScreenProps {
  userName: string;
  onReady: () => void;
}

const OnboardingReadyScreen: React.FC<OnboardingReadyScreenProps> = ({ userName, onReady }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-fade-in">
      <div className="bg-white/70 backdrop-blur-md p-8 md:p-12 rounded-2xl shadow-lg border border-orange-100 max-w-lg w-full">
        <div className="text-teal-600 mb-4">
            <OutfitIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-teal-800">
          Ready with your outfits, {userName}?
        </h1>
        <p className="mt-4 text-stone-600">
          Grab your favorite pieces from your wardrobe or find screenshots of styles you love online.
        </p>
        <p className="mt-2 text-stone-600 font-medium">
          Aara is excited to see what you've got!
        </p>
        <button
          onClick={onReady}
          className="mt-8 w-full bg-teal-600 text-white font-bold py-4 px-12 rounded-full text-lg hover:bg-teal-700 transition-colors duration-300 transform hover:scale-105 shadow-md"
        >
          Let's Go!
        </button>
      </div>
    </div>
  );
};

export default OnboardingReadyScreen;
