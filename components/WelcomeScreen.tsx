import React from 'react';
import { UserChoice } from '../types';
import { CameraIcon, SparklesIcon, OutfitIcon, JewelleryIcon } from './icons';

interface WelcomeScreenProps {
  onChoice: (choice: UserChoice) => void;
  userName: string;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onChoice, userName }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-teal-800 tracking-wider font-[Georgia,serif]">
        Aara
      </h1>
      <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-2xl text-teal-700 font-medium">
        Your AI stylist with a desi soul.
      </p>
      <p className="mt-4 sm:mt-6 max-w-2xl text-sm sm:text-base md:text-lg text-stone-600">
        Hi {userName}, I’m your personal stylist. Let’s create looks that feel so you.
      </p>

      <div className="mt-6 sm:mt-12 w-full max-w-4xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <ChoiceCard
              icon={<CameraIcon />}
              title="See it on You"
              description="Upload your photo and outfit. I'll create a virtual try-on and style your look."
              hoverText="See yourself styled."
              onClick={() => onChoice('photo')}
            />
            <ChoiceCard
              icon={<SparklesIcon />}
              title="Create AI Model"
              description="Describe your features to create a personal AI model and try on your outfits."
              hoverText="Style privately, no photo needed."
              onClick={() => onChoice('model')}
            />
            <ChoiceCard
              icon={<OutfitIcon />}
              title="Choose My Outfit"
              description="Upload up to 3 outfits and I'll pick the best one for your event."
              hoverText="Get expert advice on your wardrobe."
              onClick={() => onChoice('occasion')}
            />
            <ChoiceCard
              icon={<JewelleryIcon />}
              title="Pick My Jewellery"
              description="Upload your outfit and two jewellery options. I'll find the perfect match."
              hoverText="Accessorize with confidence."
              onClick={() => onChoice('jewellery')}
            />
        </div>
      </div>
    </div>
  );
};


interface ChoiceCardProps {
    // fix: The generic `React.ReactElement` was too broad. Specifying `React.SVGProps<SVGSVGElement>` ensures
    // TypeScript knows that props like `className` are valid for the icon element.
    icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
    title: string;
    description: string;
    hoverText: string;
    onClick: () => void;
}

const ChoiceCard: React.FC<ChoiceCardProps> = ({ icon, title, description, hoverText, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="bg-white/60 backdrop-blur-sm p-3 sm:p-6 rounded-2xl shadow-lg hover:shadow-orange-200 transition-all duration-300 ease-in-out transform hover:-translate-y-1 sm:hover:-translate-y-2 border border-orange-200 hover:border-orange-300 text-left flex flex-col items-center text-center group h-full"
        >
            <div className="text-teal-600 transition-transform duration-300 group-hover:scale-110 mb-2 sm:mb-4">
                {React.cloneElement(icon, { className: "h-8 w-8 sm:h-12 sm:w-12" })}
            </div>
            <h3 className="text-sm sm:text-xl font-bold text-teal-700">{title}</h3>
            <p className="mt-1 sm:mt-2 text-stone-600 text-xs sm:text-sm flex-grow">{description}</p>
            <p className="mt-2 sm:mt-3 text-[11px] sm:text-xs leading-tight text-orange-600 font-semibold h-8 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                {hoverText}
            </p>
        </button>
    )
}

export default WelcomeScreen;