import React from 'react';
import { StyleResult } from '../types';
import { LipstickIcon, SparkleIcon, BagIcon, ShoeIcon, ScissorIcon, RefreshIcon, DownloadIcon, LightBulbIcon, OutfitIcon } from './icons';

interface ResultScreenProps {
  result: StyleResult;
  onReset: () => void;
}

const InfoCard: React.FC<{ icon: React.ReactElement<React.SVGProps<SVGSVGElement>>, title: string, children: React.ReactNode }> = ({ icon, title, children }) => {
  return (
    <div className="bg-white/60 backdrop-blur-sm p-4 sm:p-5 rounded-2xl shadow-lg border border-orange-100">
      <div className="flex items-center mb-3">
        <div className="text-orange-500 mr-2 sm:mr-3">{React.cloneElement(icon, { className: "h-5 w-5 sm:h-6 sm:w-6" })}</div>
        <h3 className="text-lg sm:text-xl font-bold text-teal-800">{title}</h3>
      </div>
      <div className="text-gray-700 pl-7 sm:pl-9">
        {children}
      </div>
    </div>
  );
};

const ResultScreen: React.FC<ResultScreenProps> = ({ result, onReset }) => {
  const { advice, imageUrl, reasoning, chosenItemImageUrl } = result;

  // State declarations
  // (Bridal feedback state removed as requested)

  // Helper functions
  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'aara-styled-look.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Side: Image */}
        <div className="flex flex-col items-center">
          <div className="w-full aspect-[3/4] bg-orange-100 rounded-2xl shadow-xl overflow-hidden flex items-center justify-center">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="AI Styled Look" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-center p-6">
                <OutfitIcon className="h-16 w-16 text-orange-300 mx-auto mb-4" />
                <p className="text-teal-800 font-medium">Image generation unavailable</p>
                <p className="text-teal-600 text-sm mt-2">We couldn't visualize this look, but your style guide is ready below!</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 mt-6">
            <button 
              onClick={onReset} 
              className="flex items-center gap-2 bg-white text-teal-700 font-semibold py-2 px-6 rounded-full shadow-md hover:bg-gray-100 transition-colors"
            >
              <RefreshIcon className="h-5 w-5" />
              Style Another
            </button>
            <button 
              onClick={handleDownload} 
              disabled={!imageUrl}
              className="flex items-center gap-2 bg-teal-600 text-white font-semibold py-2 px-6 rounded-full shadow-md hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DownloadIcon className="h-5 w-5" />
              Download Look
            </button>
          </div>
        </div>

        {/* Right Side: Advice */}
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-teal-800">Your Style Guide</h1>

          {reasoning && (
            <InfoCard icon={<LightBulbIcon />} title="Aara's Choice">
              <p>{reasoning}</p>
            </InfoCard>
          )}

          {chosenItemImageUrl && (
            <div className="bg-white/60 backdrop-blur-sm p-4 sm:p-5 rounded-2xl shadow-lg border border-orange-100">
              <h3 className="text-lg sm:text-xl font-bold text-teal-800 text-center mb-3">Your Winning Piece!</h3>
              <img 
                src={chosenItemImageUrl} 
                alt="Chosen Item" 
                className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg mx-auto shadow-md" 
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {advice.finalLookDescription && (
            <InfoCard icon={<OutfitIcon />} title="Your Custom Look">
              <p className="text-lg font-medium text-teal-900 mb-2">The Vision:</p>
              <p>{advice.finalLookDescription}</p>
            </InfoCard>
          )}

          {advice.outfitPairing && (
            <InfoCard icon={<SparkleIcon />} title="Outfit Pairing">
              <p className="text-lg font-medium text-teal-900 mb-2">How to style your piece:</p>
              <p>{advice.outfitPairing}</p>
            </InfoCard>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {advice.makeupIdeas && advice.makeupIdeas.length > 0 && (
              <InfoCard icon={<LipstickIcon />} title="Makeup Ideas">
                <ul className="list-disc list-inside space-y-1">
                  {advice.makeupIdeas.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </InfoCard>
            )}
            {advice.hairstyles && advice.hairstyles.length > 0 && (
              <InfoCard icon={<ScissorIcon />} title="Hairstyles">
                <ul className="list-disc list-inside space-y-1">
                  {advice.hairstyles.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </InfoCard>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {advice.accessories && (
              <InfoCard icon={<BagIcon />} title="Accessories">
                <ul className="list-disc list-inside space-y-1">
                  {advice.accessories.jewelry?.map((item, i) => <li key={i}>{item}</li>)}
                  {advice.accessories.bag && <li>{advice.accessories.bag}</li>}
                </ul>
              </InfoCard>
            )}
            {advice.accessories?.footwear && (
              <InfoCard icon={<ShoeIcon />} title="Footwear">
                <ul className="list-disc list-inside space-y-1">
                  {advice.accessories.footwear.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </InfoCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;
