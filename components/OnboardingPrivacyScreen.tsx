import React from 'react';
import { CheckCircleIcon } from './icons';

interface OnboardingPrivacyScreenProps {
  userName: string;
  onAccept: () => void;
}

const OnboardingPrivacyScreen: React.FC<OnboardingPrivacyScreenProps> = ({ userName, onAccept }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-fade-in">
      <div className="bg-white/70 backdrop-blur-md p-8 md:p-12 rounded-2xl shadow-lg border border-orange-100 max-w-lg w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-teal-800">
          Great to meet you, {userName}!
        </h1>
        <p className="mt-4 text-base sm:text-lg font-semibold text-stone-700">
          Your Privacy is My Priority
        </p>
        <p className="mt-2 text-stone-600">
          Before we begin, I want you to feel completely comfortable.
        </p>
        <ul className="mt-6 text-left space-y-4">
          <li className="flex items-start gap-3">
            <CheckCircleIcon className="h-6 w-6 text-teal-500 flex-shrink-0 mt-0.5" />
            <span>Photos you upload or capture are processed right here on your device.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircleIcon className="h-6 w-6 text-teal-500 flex-shrink-0 mt-0.5" />
            <span>I <strong className="font-semibold text-teal-700">never</strong> store or save your images. Your session is 100% private.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircleIcon className="h-6 w-6 text-teal-500 flex-shrink-0 mt-0.5" />
            <span>You are in complete control of your data.</span>
          </li>
        </ul>
        <button
          onClick={onAccept}
          className="mt-8 w-full bg-teal-600 text-white font-bold py-4 px-12 rounded-full text-lg hover:bg-teal-700 transition-colors duration-300 transform hover:scale-105 shadow-md"
        >
          I Understand, Let's Begin!
        </button>
      </div>
    </div>
  );
};

export default OnboardingPrivacyScreen;
