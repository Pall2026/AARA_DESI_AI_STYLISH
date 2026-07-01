import React, { useState } from 'react';
import { ImageFile, JewelleryStyleRequest } from '../types';
import { ArrowLeftIcon, SparklesIcon } from './icons';
import { ImageUploader } from './ImageUploader';
import { SelectInput } from './FormControls';

interface JewelleryInputScreenProps {
  onJewelleryStyleRequest: (request: JewelleryStyleRequest) => void;
  error: string | null;
  onBack: () => void;
}

const JewelleryInputScreen: React.FC<JewelleryInputScreenProps> = ({ onJewelleryStyleRequest, error, onBack }) => {
  const [userOutfitImage, setUserOutfitImage] = useState<ImageFile | null>(null);
  const [jewelleryOptions, setJewelleryOptions] = useState<(ImageFile | null)[]>([null, null]);
  const [occasion, setOccasion] = useState('Wedding Guest');
  const [timeOfDay, setTimeOfDay] = useState('Day');
  const [venue, setVenue] = useState('Outdoor');
  const [religion, setReligion] = useState('Hindu');
  const [region, setRegion] = useState('North Indian');
  const [formError, setFormError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setImage: React.Dispatch<React.SetStateAction<ImageFile | null>>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setFormError("File size should not exceed 4MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result?.toString().split(',')[1];
        if (base64String) {
          setImage({ file, base64: base64String, mimeType: file.type });
          setFormError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleJewelleryFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setFormError("File size should not exceed 4MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result?.toString().split(',')[1];
        if (base64String) {
          const newOptions = [...jewelleryOptions];
          newOptions[index] = { file, base64: base64String, mimeType: file.type };
          setJewelleryOptions(newOptions);
          setFormError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUserImageCapture = (imageFile: ImageFile) => {
    setUserOutfitImage(imageFile);
    setFormError(null);
  }

  const isWeddingOccasion = occasion === 'My Wedding (Bride)' || occasion === 'My Wedding (Groom)';

  const handleSubmit = () => {
    if (!userOutfitImage) {
      setFormError("Please upload a photo of you in your outfit.");
      return;
    }
    if (jewelleryOptions.some(opt => opt === null)) {
        setFormError("Please upload two jewellery options to compare.");
        return;
    }
    setFormError(null);
    const request: JewelleryStyleRequest = {
      userChoice: 'jewellery',
      userOutfitImage,
      jewelleryOptions: jewelleryOptions as [ImageFile, ImageFile],
      occasion,
      timeOfDay,
      venue,
      religion: isWeddingOccasion ? religion : undefined,
      region: isWeddingOccasion ? region : undefined,
    };
    onJewelleryStyleRequest(request);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-teal-700 hover:text-teal-900 font-semibold mb-6">
        <ArrowLeftIcon className="h-5 w-5" />
        Back to Start
      </button>
      <div className="bg-white/70 backdrop-blur-md p-4 md:p-8 rounded-2xl shadow-lg border border-orange-100">
        <h2 className="text-2xl md:text-3xl font-bold text-teal-800 mb-2">Choose My Jewellery</h2>
        <p className="text-gray-600 mb-8">Upload a full-body photo of your outfit and two jewellery options to find the perfect match.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ImageUploader 
                id="user-outfit-photo"
                name="user-outfit-photo" 
                label="Your Full Outfit Photo" 
                image={userOutfitImage} 
                onImageChange={(e) => handleFileChange(e, setUserOutfitImage)} 
                onImageCapture={handleUserImageCapture} 
                onRemove={() => setUserOutfitImage(null)} 
                allowLivePhoto
                description="For the best advice, please use a clear, full-body photo. This helps Aara respect your unique features and body type. While we aim for a perfect match, AI generations can sometimes be imperfect."
                aspectRatio="portrait"
            />
            
            <div className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-teal-800">Jewellery Options</h3>
                    <ImageUploader id="jewellery-1" name="jewellery-1" label="Option 1" image={jewelleryOptions[0]} onImageChange={(e) => handleJewelleryFileChange(e, 0)} onRemove={() => setJewelleryOptions(prev => [null, prev[1]])} />
                    <ImageUploader id="jewellery-2" name="jewellery-2" label="Option 2" image={jewelleryOptions[1]} onImageChange={(e) => handleJewelleryFileChange(e, 1)} onRemove={() => setJewelleryOptions(prev => [prev[0], null])} />
                </div>
                 <div className="space-y-6 p-6 bg-orange-50/50 rounded-xl">
                    <h3 className="text-xl font-semibold text-teal-800">Event Details</h3>
                    <SelectInput id="occasion" name="occasion" label="Occasion" value={occasion} onChange={e => setOccasion(e.target.value)} options={["Wedding Guest", "My Wedding (Bride)", "My Wedding (Groom)", "Sangeet / Mehendi", "Puja / Religious Ceremony", "Festive Party (Diwali, etc)", "Romantic Date", "Casual Day Out", "Formal Dinner", "Work Event"]} />
                    <SelectInput id="time-of-day" name="time-of-day" label="Time of Day" value={timeOfDay} onChange={e => setTimeOfDay(e.target.value)} options={["Day", "Night", "Evening"]} />
                    <SelectInput id="venue" name="venue" label="Venue" value={venue} onChange={e => setVenue(e.target.value)} options={["Indoor", "Outdoor", "Mixed Indoor/Outdoor"]} />

                    {isWeddingOccasion && (
                        <div className="animate-fade-in space-y-4 pt-4 border-t border-orange-200">
                            <h4 className="text-lg font-semibold text-teal-800">Wedding Details</h4>
                            <SelectInput 
                                id="religion"
                                name="religion"
                                label="Cultural Background" 
                                value={religion} 
                                onChange={e => setReligion(e.target.value)} 
                                options={["Hindu", "Muslim", "Sikh", "Christian", "Other/Secular"]} 
                            />
                            <SelectInput 
                                id="region"
                                name="region"
                                label="Region of India" 
                                value={region} 
                                onChange={e => setRegion(e.target.value)} 
                                options={[
                                    "North Indian", 
                                    "South Indian", 
                                    "Western Indian", 
                                    "Eastern Indian", 
                                    "Central Indian",
                                    "North-Eastern Indian"
                                ]} 
                            />
                            <p className="text-xs text-gray-600 bg-orange-100 p-2 rounded-lg">Aara strives for cultural accuracy, but traditions are vast. We apologize if we miss any nuances. Your feedback helps us learn!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        {(formError || error) && <p className="text-red-500 text-center mt-6">{formError || error}</p>}

        <div className="mt-8 text-center">
            <button
            onClick={handleSubmit}
            className="bg-teal-600 text-white font-bold py-3 px-12 rounded-full text-lg hover:bg-teal-700 transition-colors duration-300 transform hover:scale-105 shadow-md flex items-center justify-center gap-2 mx-auto"
            >
                <SparklesIcon className="h-6 w-6" />
                Find the Best Match
            </button>
        </div>
      </div>
    </div>
  );
};

export default JewelleryInputScreen;