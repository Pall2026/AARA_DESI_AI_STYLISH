import React, { useState } from 'react';
import { ImageFile, OccasionStyleRequest } from '../types';
import { ArrowLeftIcon, SparklesIcon, PlusIcon } from './icons';
import { ImageUploader } from './ImageUploader';
import { RadioPill, SelectInput } from './FormControls';


interface OccasionInputScreenProps {
  onOccasionStyleRequest: (request: OccasionStyleRequest) => void;
  error: string | null;
  onBack: () => void;
}

const OccasionInputScreen: React.FC<OccasionInputScreenProps> = ({ onOccasionStyleRequest, error, onBack }) => {
  const [clothingImages, setClothingImages] = useState<(ImageFile | null)[]>([null]);
  const [occasion, setOccasion] = useState('Wedding Guest');
  const [timeOfDay, setTimeOfDay] = useState('Day');
  const [venue, setVenue] = useState('Outdoor');
  const [religion, setReligion] = useState('Hindu');
  const [region, setRegion] = useState('North Indian');
  const [formError, setFormError] = useState<string | null>(null);
  
  const [gender, setGender] = useState<'Female' | 'Male'>('Female');
  const [hairLength, setHairLength] = useState<string>('Long');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
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
          const newImages = [...clothingImages];
          newImages[index] = { file, base64: base64String, mimeType: file.type };
          setClothingImages(newImages);
          setFormError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageCapture = (imageFile: ImageFile, index: number) => {
    const newImages = [...clothingImages];
    newImages[index] = imageFile;
    setClothingImages(newImages);
    setFormError(null);
  };

  const handleRemoveImage = (index: number) => {
      if (clothingImages.length > 1) {
          setClothingImages(clothingImages.filter((_, i) => i !== index));
      } else {
          setClothingImages([null]);
      }
  };

  const handleAddSlot = () => {
      if (clothingImages.length < 3) {
          setClothingImages([...clothingImages, null]);
      }
  };

  const isWeddingOccasion = occasion === 'My Wedding (Bride)' || occasion === 'My Wedding (Groom)';

  const handleSubmit = () => {
    const validImages = clothingImages.filter(img => img !== null) as ImageFile[];
    if (validImages.length === 0) {
      setFormError("Please upload at least one clothing item.");
      return;
    }
    if (!occasion || !timeOfDay || !venue) {
        setFormError("Please fill out all event details.");
        return;
    }
    setFormError(null);

    const request: OccasionStyleRequest = {
      userChoice: 'occasion',
      clothingImages: validImages,
      occasion,
      timeOfDay,
      venue,
      gender,
      hairLength,
      religion: isWeddingOccasion ? religion : undefined,
      region: isWeddingOccasion ? region : undefined,
    };
    onOccasionStyleRequest(request);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-teal-700 hover:text-teal-900 font-semibold mb-6">
        <ArrowLeftIcon className="h-5 w-5" />
        Back to Start
      </button>
      <div className="bg-white/70 backdrop-blur-md p-4 md:p-8 rounded-2xl shadow-lg border border-orange-100">
        <h2 className="text-2xl md:text-3xl font-bold text-teal-800 mb-2">Choose My Outfit</h2>
        <p className="text-gray-600 mb-8">Upload your options and tell us about the event.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <h3 className="text-xl font-semibold text-teal-800">Clothing Options</h3>
                {clothingImages.map((image, index) => (
                    <ImageUploader 
                        key={index}
                        id={`clothing-photo-${index}`}
                        name={`clothing-photo-${index}`} 
                        label={`Option ${index + 1}`}
                        image={image} 
                        onImageChange={(e) => handleFileChange(e, index)} 
                        onImageCapture={(file) => handleImageCapture(file, index)}
                        onRemove={() => handleRemoveImage(index)}
                        allowLivePhoto
                    />
                ))}
                {clothingImages.length < 3 && clothingImages.every(img => img !== null) && (
                    <button onClick={handleAddSlot} className="w-full border-2 border-dashed border-orange-300 rounded-xl flex items-center justify-center text-center p-4 h-20 text-orange-600 hover:bg-orange-50 transition">
                       <PlusIcon className="h-6 w-6 mr-2" /> Add Another Option
                    </button>
                )}
            </div>
            <div className="space-y-6 p-6 bg-orange-50/50 rounded-xl">
                 <h3 className="text-xl font-semibold text-teal-800">Model & Event Details</h3>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Generate a Model for:</label>
                    <div className="flex gap-4">
                        <RadioPill name="gender" value="Female" checked={gender === 'Female'} onChange={(e) => setGender(e.target.value as 'Female' | 'Male')} label="Female" />
                        <RadioPill name="gender" value="Male" checked={gender === 'Male'} onChange={(e) => setGender(e.target.value as 'Female' | 'Male')} label="Male" />
                    </div>
                </div>
                 <SelectInput id="hair-length" name="hair-length" label="Preferred Hair Length" value={hairLength} onChange={e => setHairLength(e.target.value)} options={["Short", "Medium", "Long"]} />
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
        
        {(formError || error) && <p className="text-red-500 text-center mt-6">{formError || error}</p>}

        <div className="mt-8 text-center">
            <button
            onClick={handleSubmit}
            className="bg-teal-600 text-white font-bold py-3 px-12 rounded-full text-lg hover:bg-teal-700 transition-colors duration-300 transform hover:scale-105 shadow-md flex items-center justify-center gap-2 mx-auto"
            >
                <SparklesIcon className="h-6 w-6" />
                Get Advice
            </button>
        </div>
      </div>
    </div>
  );
};

export default OccasionInputScreen;