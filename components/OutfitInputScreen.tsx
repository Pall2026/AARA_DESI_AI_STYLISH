import React, { useState, useEffect } from 'react';
import { ModelDescription, ImageFile, StyleRequest } from '../types';
import { ArrowLeftIcon, SparklesIcon } from './icons';
import { ImageUploader } from './ImageUploader';
import { SelectInput } from './FormControls';

interface OutfitInputScreenProps {
  faceFeatures: ModelDescription;
  faceImage: ImageFile;
  onStyleRequest: (request: StyleRequest) => void;
  error: string | null;
  onBack: () => void;
}

const ORDERED_TOP_WEAR_OPTIONS = [
    // -- Tops (Separates) --
   "Top", "T-Shirt", "Shirt", "Long Kurti", "Short Kurti", "Kurta", 
   "Ethnic Crop Top", "Ethnic Peplum Top", "Asymmetrical Kurti/Tunic", 
   "Cape Top", "Kaftan Top", "Fusion Shirt-Style Top", "Blouson Top",
    // -- Layers (Separates) --
   "Jacket", "Blazer", "Sweater", "Sweatshirt", "Bandhgala Jacket",
    // -- Coordinated Sets (Image contains both pieces) --
   "Kurti & Bottoms Set", "Top & Bottoms Set", "Shirt & Bottoms Set", "T-Shirt & Bottoms Set",
    // -- Full Outfits (Single Garment or Traditional Set) --
   "Saree", "Dress", "Jumpsuit", "Salwar Suit Set", "Lehenga Set", 
   "Sherwani", "Sherwani Set", "Kurta Pajama"
];

const FULL_OUTFIT_TYPES = [
   // Single Garment Outfits
   "Saree", "Dress", "Jumpsuit",
   // Traditional Sets
   "Salwar Suit Set", "Lehenga Set", "Sherwani", "Sherwani Set", "Kurta Pajama",
   // Coordinated Two-Piece Sets (from a single image)
   "Kurti & Bottoms Set", "Top & Bottoms Set", "Shirt & Bottoms Set", "T-Shirt & Bottoms Set"
];

const OutfitInputScreen: React.FC<OutfitInputScreenProps> = ({ faceFeatures, faceImage, onStyleRequest, error, onBack }) => {
  const [topWearImage, setTopWearImage] = useState<ImageFile | null>(null);
  const [topWearType, setTopWearType] = useState<string>('Long Kurti');
  const [topWearMaterial, setTopWearMaterial] = useState<string>('Cotton');
  const [blouseImage, setBlouseImage] = useState<ImageFile | null>(null);

  const [bottomWearImage, setBottomWearImage] = useState<ImageFile | null>(null);
  const [bottomWearType, setBottomWearType] = useState<string>('Pants');
  const [bottomWearMaterial, setBottomWearMaterial] = useState<string>('Cotton');
  const [jeanStyle, setJeanStyle] = useState<string>('Skinny');
  
  const [occasion, setOccasion] = useState('Wedding Guest');
  const [timeOfDay, setTimeOfDay] = useState('Day');
  const [venue, setVenue] = useState('Outdoor');
  const [religion, setReligion] = useState('Hindu');
  const [region, setRegion] = useState('North Indian');
  
  const [hairTexture, setHairTexture] = useState<string>(faceFeatures.hairTexture);
  const [hairLength, setHairLength] = useState<string>(faceFeatures.hairLength);
  const [hairStylePreference, setHairStylePreference] = useState<string>(
    faceFeatures.gender === 'Male' ? 'Messy / Textured' : 'Open / Down'
  );

  const [formError, setFormError] = useState<string | null>(null);

  const isFullOutfit = FULL_OUTFIT_TYPES.includes(topWearType);

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
          setImage({
            file,
            base64: base64String,
            mimeType: file.type
          });
          setFormError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const isWeddingOccasion = occasion === 'My Wedding (Bride)' || occasion === 'My Wedding (Groom)';

  const handleSubmit = () => {
    if (!topWearImage) {
      setFormError("Please upload your top wear or full outfit.");
      return;
    }
    if (topWearImage && (!topWearType || !topWearMaterial)) {
        setFormError("Please select the outfit type and material.");
        return;
    }
    if (!isFullOutfit && bottomWearImage && (!bottomWearType || !bottomWearMaterial)) {
        setFormError("Please select the bottom wear type and material if you upload an image.");
        return;
    }
    setFormError(null);

    const request: StyleRequest = {
      userChoice: 'photo',
      userImage: faceImage,
      modelDescription: { ...faceFeatures, hairLength, hairTexture },
      hairLength: hairLength,
      hairStylePreference: hairStylePreference,
      
      topWearImage: topWearImage,
      topWearType: topWearType,
      topWearMaterial: topWearMaterial,
      blouseImage: topWearType === 'Saree' ? blouseImage : undefined,

      bottomWearImage: isFullOutfit ? null : bottomWearImage,
      bottomWearType: isFullOutfit ? null : (bottomWearImage ? bottomWearType : null),
      bottomWearMaterial: isFullOutfit ? null : (bottomWearImage ? bottomWearMaterial : null),
      jeanStyle: isFullOutfit ? undefined : (bottomWearImage && bottomWearType === 'Jeans' ? jeanStyle : undefined),
      
      occasion,
      timeOfDay,
      venue,
      religion: isWeddingOccasion ? religion : undefined,
      region: isWeddingOccasion ? region : undefined,
    };

    onStyleRequest(request);
  };
  
  const femaleHairOptions = ["Short", "Medium", "Long", "Bob cut", "Bald"];
  const maleHairOptions = ["Short", "Medium", "Long", "Bald", "Classic Taper", "Crew Cut", "Undercut", "Slicked Back", "Man Bun", "Textured Crop"];
  const hairOptions = faceFeatures.gender === 'Male' ? maleHairOptions : femaleHairOptions;

  const femaleStyleOptions = ["Open / Down", "Tied / Ponytail", "Half-up Half-down", "Low Bun", "High Bun", "Side Braid", "Classic Bun with Gajra (Floral Garland)"];
  const maleStyleOptions = ["Slicked Back", "Side Part", "Messy / Textured", "Spiky / Quiff", "Neat Taper", "Man Bun"];
  const styleOptions = faceFeatures.gender === 'Male' ? maleStyleOptions : femaleStyleOptions;

  useEffect(() => {
    if (!hairOptions.includes(hairLength)) {
        setHairLength(hairOptions[0]);
    }
  }, [faceFeatures.gender, hairLength, hairOptions]);

  useEffect(() => {
    if (!styleOptions.includes(hairStylePreference)) {
        setHairStylePreference(styleOptions[0]);
    }
  }, [faceFeatures.gender, hairStylePreference, styleOptions]);


  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-teal-700 hover:text-teal-900 font-semibold mb-6">
        <ArrowLeftIcon className="h-5 w-5" />
        Back to Face Analysis
      </button>
      <div className="bg-white/70 backdrop-blur-md p-4 md:p-8 rounded-2xl shadow-lg border border-orange-100">
        <h2 className="text-2xl md:text-3xl font-bold text-teal-800 mb-2">Step 2: Style Your Outfit</h2>
        <p className="text-gray-600 mb-6">
          Aara has analyzed your features. Now, upload your outfit to see the final look!
        </p>

        <p className="text-sm text-orange-800 bg-orange-100 p-3 rounded-lg mb-6 shadow-sm">
            <strong>A quick note:</strong> While I do my best, AI is still a work in progress! Sometimes the virtual try-on might not capture your face and features with perfect accuracy. Thanks for your understanding as I learn and improve!
        </p>
        
        <div className="mb-4 p-4 bg-teal-50/70 border border-teal-200 rounded-lg">
            <h4 className="font-semibold text-teal-800">Analyzed Features:</h4>
            <p className="text-sm text-teal-700 capitalize">{[
                `${faceFeatures.faceShape} face`,
                `${faceFeatures.skinTone} skin`,
                `${faceFeatures.eyesShape} eyes`,
                faceFeatures.hairCondition ? `${faceFeatures.hairCondition.toLowerCase()} hair` : null,
            ].filter(Boolean).join(', ')}.</p>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectInput 
                id="hair-texture"
                name="hair-texture"
                label="Confirm Your Hair Type"
                value={hairTexture}
                onChange={e => setHairTexture(e.target.value)}
                options={["Straight", "Wavy", "Curly", "Coily", "Straight and Curly Combination"]}
            />
            <SelectInput 
                id="hair-length"
                name="hair-length"
                label="Confirm Your Hair Length" 
                value={hairLength} 
                onChange={e => setHairLength(e.target.value)} 
                options={hairOptions} 
            />
            <SelectInput 
                id="hair-style-preference"
                name="hair-style-preference"
                label="Preferred Hair Styling" 
                value={hairStylePreference} 
                onChange={e => setHairStylePreference(e.target.value)} 
                options={styleOptions} 
            />
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <h3 className="text-xl font-semibold text-teal-800">Your Clothing</h3>
                <p className="text-gray-600 -mt-4">Upload a top and optional bottom, or a complete outfit.</p>
                
                <div className="space-y-4">
                    <ImageUploader id="top-wear-photo" name="top-wear-photo" label="Top Wear / Full Outfit" image={topWearImage} onImageChange={(e) => handleFileChange(e, setTopWearImage)} onRemove={() => setTopWearImage(null)} />
                    {topWearImage && (
                        <div className="space-y-4 p-4 bg-orange-50/50 rounded-xl animate-fade-in">
                            <SelectInput id="top-wear-type" name="top-wear-type" label="Outfit Type" value={topWearType} onChange={e => setTopWearType(e.target.value)} options={ORDERED_TOP_WEAR_OPTIONS} />
                            <SelectInput id="top-wear-material" name="top-wear-material" label="Primary Material" value={topWearMaterial} onChange={e => setTopWearMaterial(e.target.value)} options={["Cotton", "Silk", "Denim", "Linen", "Chiffon", "Georgette", "Wool", "Synthetic"]} />
                            {topWearType === 'Saree' && (
                                <div className="animate-fade-in space-y-4">
                                    <ImageUploader id="blouse-photo" name="blouse-photo" label="Blouse (Optional)" image={blouseImage} onImageChange={(e) => handleFileChange(e, setBlouseImage)} onRemove={() => setBlouseImage(null)} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
                 <div className="space-y-4">
                    <ImageUploader id="bottom-wear-photo" name="bottom-wear-photo" label="Bottom Wear (Optional)" disabled={isFullOutfit} image={bottomWearImage} onImageChange={(e) => handleFileChange(e, setBottomWearImage)} onRemove={() => setBottomWearImage(null)} />
                    {bottomWearImage && !isFullOutfit && (
                        <div className="space-y-4 p-4 bg-orange-50/50 rounded-xl animate-fade-in">
                            <SelectInput id="bottom-wear-type" name="bottom-wear-type" label="Bottom Wear Type" value={bottomWearType} onChange={e => setBottomWearType(e.target.value)} options={["Pants", "Palazzo", "Sharara", "Lehenga Skirt", "Jeans", "Skirt", "Pajama", "Dhoti", "Churidar", "Wool Trousers", "Velvet Pants"]} />
                             {bottomWearType === 'Jeans' && (
                                <div className="animate-fade-in">
                                    <SelectInput 
                                        id="jean-style"
                                        name="jean-style"
                                        label="Jean Style" 
                                        value={jeanStyle} 
                                        onChange={e => setJeanStyle(e.target.value)} 
                                        options={[
                                            "Skinny", "Slim-fit", "Straight-leg", "Bootcut", 
                                            "Flared", "Loose-fit", "Boyfriend", "Mom Jeans", 
                                            "Tapered", "Jeggings", "Cargo", "Distressed", "Other"
                                        ]} 
                                    />
                                </div>
                            )}
                            <SelectInput id="bottom-wear-material" name="bottom-wear-material" label="Bottom Wear Material" value={bottomWearMaterial} onChange={e => setBottomWearMaterial(e.target.value)} options={["Cotton", "Silk", "Denim", "Linen", "Chiffon", "Georgette", "Wool", "Synthetic"]} />
                        </div>
                    )}
                </div>
            </div>
            <div className="lg:col-span-1 space-y-6 p-6 bg-orange-50/50 rounded-xl">
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
        
        {(formError || error) && <p className="text-red-500 text-center mt-6">{formError || error}</p>}

        <div className="mt-8 text-center">
            <button
            onClick={handleSubmit}
            className="bg-teal-600 text-white font-bold py-3 px-12 rounded-full text-lg hover:bg-teal-700 transition-colors duration-300 transform hover:scale-105 shadow-md flex items-center justify-center gap-2 mx-auto"
            >
                <SparklesIcon className="h-6 w-6" />
                Style Me Now
            </button>
        </div>
      </div>
    </div>
  );
};

export default OutfitInputScreen;