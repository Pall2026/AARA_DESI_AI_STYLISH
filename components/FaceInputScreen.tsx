import React, { useState, useEffect } from 'react';
import { ImageFile, ModelDescription } from '../types';
import { analyzeFaceFeatures } from '../services/geminiService';
import { ArrowLeftIcon, SparklesIcon, HeadOutlineIcon, DialIcon } from './icons';
import { ImageUploader } from './ImageUploader';

interface FaceInputScreenProps {
  onAnalysisComplete: (features: ModelDescription, image: ImageFile) => void;
  onBack: () => void;
}

const FaceInputScreen: React.FC<FaceInputScreenProps> = ({ onAnalysisComplete, onBack }) => {
  const [faceImage, setFaceImage] = useState<ImageFile | null>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'analyzed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ModelDescription | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleImageCapture = (imageFile: ImageFile) => {
    setFaceImage(imageFile);
    setError(null);
  };

  const processFile = (file: File) => {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError("File size exceeds 4MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result?.toString().split(',')[1];
        if (base64String) {
          setFaceImage({ file, base64: base64String, mimeType: file.type });
          setError(null);
        }
      };
      reader.readAsDataURL(file);
  };
  
  const handleAnalyze = async () => {
    if (!faceImage) {
      setError("Please provide a photo to analyze.");
      return;
    }
    setStatus('analyzing');
    setError(null);
    try {
      const features = await analyzeFaceFeatures(faceImage);
      setAnalysisResult(features);
      setStatus('analyzed');
    } catch(err) {
      console.error("Error in handleAnalyze:", err);
      setError("Analysis failed. The AI couldn't process this image. Please try a different photo with a clear view of the face.");
      setStatus('idle');
    }
  };

  const handleProceed = () => {
    if (analysisResult && faceImage) {
      onAnalysisComplete(analysisResult, faceImage);
    }
  };

  const handleReset = () => {
    setFaceImage(null);
    setStatus('idle');
    setError(null);
    setAnalysisResult(null);
  }

  const renderContent = () => {
    switch (status) {
      case 'analyzing':
        return <AnalysisLoader />;
      case 'analyzed':
        return analysisResult && faceImage && <AnalysisDisplay image={faceImage} results={analysisResult} onProceed={handleProceed} />;
      case 'idle':
      default:
        return (
          <>
            <ImageUploader 
                id="face-photo"
                name="face-photo" 
                image={faceImage} 
                onImageChange={handleFileSelect} 
                onImageCapture={handleImageCapture} 
                onRemove={handleReset} 
                allowLivePhoto 
                aspectRatio="portrait"
            />

            {error && <p className="text-red-500 text-center mt-6">{error}</p>}
            
            <div className="mt-8 text-center">
                <button
                onClick={handleAnalyze}
                disabled={!faceImage}
                className="bg-teal-600 text-white font-bold py-3 px-12 rounded-full text-lg hover:bg-teal-700 transition-colors duration-300 transform hover:scale-105 shadow-md flex items-center justify-center gap-2 mx-auto disabled:bg-gray-400 disabled:text-gray-200 disabled:shadow-none disabled:cursor-not-allowed"
                >
                    <SparklesIcon className="h-6 w-6" />
                    Analyze Face
                </button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button onClick={status === 'idle' ? onBack : handleReset} className="flex items-center gap-2 text-teal-700 hover:text-teal-900 font-semibold mb-6">
        <ArrowLeftIcon className="h-5 w-5" />
        {status === 'idle' ? 'Back to Start' : 'Analyze New Photo'}
      </button>
      <div className="bg-white/70 backdrop-blur-md p-4 md:p-8 rounded-2xl shadow-lg border border-orange-100">
        <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-teal-800 mb-2">Feature Analysis</h2>
            <p className="text-gray-600">
              {status === 'analyzed' 
                ? 'Analysis complete! Here is what I see.' 
                : 'Upload a clear, forward-facing photo so I can get to know your features.'
              }
            </p>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

const AnalysisLoader: React.FC = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="relative flex items-center justify-center">
         <DialIcon className="h-24 w-24 text-teal-500 animate-spin" style={{ animationDuration: '3s' }}/>
      </div>
      <h2 className="mt-8 text-2xl font-bold text-teal-700">ANALYZING...</h2>
      <p className="mt-2 text-lg text-orange-600">Getting to know your features...</p>
    </div>
);

const AnalysisDisplay: React.FC<{image: ImageFile, results: ModelDescription, onProceed: () => void}> = ({ image, results, onProceed }) => {
    const [showScanline, setShowScanline] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowScanline(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const resultItems = {
        "Skin Tone": results.skinTone,
        "Face Shape": results.faceShape,
        "Hair Color": results.hairColor,
        "Hair Condition": results.hairCondition,
        "Eye Shape": results.eyesShape,
        "Eye Color": results.eyeColor,
        "Nose Shape": results.noseShape,
        "Lips Shape": results.lipsShape,
    };

    return (
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            <div className="relative w-full max-w-sm mx-auto aspect-[3/4] rounded-lg overflow-hidden border-2 border-orange-200 shadow-md bg-black/5">
                <img src={URL.createObjectURL(image.file)} alt="Analyzed face" className="w-full h-full object-cover" />
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-2 left-2 w-10 h-10 border-l-4 border-t-4 border-orange-400"></div>
                    <div className="absolute top-2 right-2 w-10 h-10 border-r-4 border-t-4 border-orange-400"></div>
                    <div className="absolute bottom-2 left-2 w-10 h-10 border-l-4 border-b-4 border-orange-400"></div>
                    <div className="absolute bottom-2 right-2 w-10 h-10 border-r-4 border-b-4 border-orange-400"></div>
                    {showScanline && <div className="scanline" style={{ animationDelay: '0.2s' }}></div>}
                </div>
            </div>
            <div className="w-full lg:flex-1 bg-white p-6 rounded-xl border border-orange-100 shadow-sm">
                 <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div className="col-span-2 text-xl font-bold text-teal-800 border-b border-orange-100 pb-2 mb-2 flex items-center gap-2">
                        <SparklesIcon className="h-5 w-5 text-orange-500 animate-pulse" />
                        <span>Detected Features:</span>
                    </div>
                    {Object.entries(resultItems).map(([key, value]) => value && (
                        <React.Fragment key={key}>
                            <div className="text-gray-500 text-sm py-1 border-b border-gray-50/50">{key}</div>
                            <div className="text-teal-700 font-semibold py-1 border-b border-gray-50/50 capitalize">{value}</div>
                        </React.Fragment>
                    ))}
                 </div>
                 <button
                    onClick={onProceed}
                    className="mt-8 w-full bg-teal-600 text-white font-bold py-3.5 px-12 rounded-full text-lg hover:bg-teal-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-md flex items-center justify-center gap-2 mx-auto"
                >
                    Proceed to Styling
                </button>
            </div>
        </div>
    );
};


export default FaceInputScreen;