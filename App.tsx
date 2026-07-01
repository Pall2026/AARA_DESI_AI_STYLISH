import React, { useState, useCallback } from 'react';
import { AppState, UserChoice, StyleResult, StyleRequest, OccasionStyleRequest, JewelleryStyleRequest, ImageFile, ModelDescription } from './types';
import WelcomeScreen from './components/WelcomeScreen';
import InputScreen from './components/InputScreen';
import LoadingScreen from './components/LoadingScreen';
import ResultScreen from './components/ResultScreen';
import OccasionInputScreen from './components/OccasionInputScreen';
import JewelleryInputScreen from './components/JewelleryInputScreen';
import FaceInputScreen from './components/FaceInputScreen';
import OutfitInputScreen from './components/OutfitInputScreen';
import OnboardingNameScreen from './components/OnboardingNameScreen';
import OnboardingPrivacyScreen from './components/OnboardingPrivacyScreen';
import OnboardingReadyScreen from './components/OnboardingReadyScreen';
import { generateStyleAdviceAndImage, generateOccasionStyleAdvice, generateJewelleryAdvice } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.ONBOARDING_NAME);
  const [userName, setUserName] = useState<string>('');
  const [userChoice, setUserChoice] = useState<UserChoice | null>(null);
  const [styleResult, setStyleResult] = useState<StyleResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [faceFeatures, setFaceFeatures] = useState<ModelDescription | null>(null);
  const [faceImage, setFaceImage] = useState<ImageFile | null>(null);

  const handleGoToWelcome = useCallback(() => {
    setAppState(AppState.WELCOME);
    setUserChoice(null);
    setStyleResult(null);
    setError(null);
    setFaceFeatures(null);
    setFaceImage(null);
  }, []);

  const handleStartOver = useCallback(() => {
    setStyleResult(null);
    setError(null);
    
    if (userChoice === 'photo') {
      setFaceFeatures(null);
      setFaceImage(null);
      setAppState(AppState.INPUT_FACE);
    } else if (userChoice) {
      setAppState(AppState.INPUT);
    } else {
      handleGoToWelcome();
    }
  }, [userChoice, handleGoToWelcome]);

  const handleNameSubmit = useCallback((name: string) => {
    setUserName(name);
    setAppState(AppState.ONBOARDING_PRIVACY);
  }, []);

  const handlePrivacyAccept = useCallback(() => {
    setAppState(AppState.ONBOARDING_READY);
  }, []);

  const handleReady = useCallback(() => {
    setAppState(AppState.WELCOME);
  }, []);

  const handleChoice = useCallback((choice: UserChoice) => {
    setUserChoice(choice);
    setError(null);
    setFaceFeatures(null);
    setFaceImage(null);
    if (choice === 'photo') {
      setAppState(AppState.INPUT_FACE);
    } else {
      setAppState(AppState.INPUT);
    }
  }, []);

  const handleAnalysisComplete = useCallback((features: ModelDescription, image: ImageFile) => {
    setFaceFeatures(features);
    setFaceImage(image);
    setAppState(AppState.INPUT_OUTFIT);
    setError(null);
  }, []);

  const handleStyleRequest = useCallback(async (request: StyleRequest) => {
    setAppState(AppState.LOADING);
    setError(null);
    try {
      const result = await generateStyleAdviceAndImage(request);
      setStyleResult(result);
      setAppState(AppState.RESULT);
    } catch (err) {
      console.error("Error generating style:", err);
      setError("Sorry, we couldn't generate your style. Please try again.");
      setAppState(faceFeatures ? AppState.INPUT_OUTFIT : AppState.INPUT);
    }
  }, [faceFeatures]);
  
  const handleOccasionStyleRequest = useCallback(async (request: OccasionStyleRequest) => {
    setAppState(AppState.LOADING);
    setError(null);
    try {
      const result = await generateOccasionStyleAdvice(request);
      setStyleResult(result);
      setAppState(AppState.RESULT);
    } catch (err) {
      console.error("Error generating occasion style:", err);
      setError("Sorry, we couldn't pick an outfit. Please try again.");
      setAppState(AppState.INPUT);
    }
  }, []);

  const handleJewelleryStyleRequest = useCallback(async (request: JewelleryStyleRequest) => {
    setAppState(AppState.LOADING);
    setError(null);
    try {
      const result = await generateJewelleryAdvice(request);
      setStyleResult(result);
      setAppState(AppState.RESULT);
    } catch (err) {
      console.error("Error generating jewellery advice:", err);
      setError("Sorry, we couldn't pick your jewellery. Please try again.");
      setAppState(AppState.INPUT);
    }
  }, []);

  const renderContent = () => {
    switch (appState) {
      case AppState.ONBOARDING_NAME:
        return <OnboardingNameScreen onNameSubmit={handleNameSubmit} />;
      case AppState.ONBOARDING_PRIVACY:
        return <OnboardingPrivacyScreen userName={userName} onAccept={handlePrivacyAccept} />;
      case AppState.ONBOARDING_READY:
        return <OnboardingReadyScreen userName={userName} onReady={handleReady} />;
      case AppState.WELCOME:
        return <WelcomeScreen onChoice={handleChoice} userName={userName} />;
      case AppState.INPUT:
        if (!userChoice) {
            handleGoToWelcome();
            return null;
        }
        if (userChoice === 'model') {
            return <InputScreen onStyleRequest={handleStyleRequest} error={error} onBack={handleGoToWelcome} />;
        }
        if (userChoice === 'occasion') {
            return <OccasionInputScreen onOccasionStyleRequest={handleOccasionStyleRequest} error={error} onBack={handleGoToWelcome} />;
        }
        if (userChoice === 'jewellery') {
            return <JewelleryInputScreen onJewelleryStyleRequest={handleJewelleryStyleRequest} error={error} onBack={handleGoToWelcome} />;
        }
        return null;
      case AppState.INPUT_FACE:
        return <FaceInputScreen onAnalysisComplete={handleAnalysisComplete} onBack={handleGoToWelcome} />;
      case AppState.INPUT_OUTFIT:
        if (!faceFeatures || !faceImage) {
            handleGoToWelcome();
            return null;
        }
        return <OutfitInputScreen 
                    faceFeatures={faceFeatures} 
                    faceImage={faceImage}
                    onStyleRequest={handleStyleRequest} 
                    error={error} 
                    onBack={() => setAppState(AppState.INPUT_FACE)} 
                />;
      case AppState.LOADING:
        return <LoadingScreen />;
      case AppState.RESULT:
        return styleResult ? <ResultScreen result={styleResult} onReset={handleStartOver} /> : <LoadingScreen />;
      default:
        return <OnboardingNameScreen onNameSubmit={handleNameSubmit} />;
    }
  };

  return (
    <div className="min-h-screen text-stone-700 font-sans antialiased">
      <main className="container mx-auto p-2 sm:p-4 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
