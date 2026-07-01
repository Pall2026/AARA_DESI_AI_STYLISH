export enum AppState {
  ONBOARDING_NAME = 'onboarding_name',
  ONBOARDING_PRIVACY = 'onboarding_privacy',
  ONBOARDING_READY = 'onboarding_ready',
  WELCOME = 'welcome',
  INPUT = 'input',
  INPUT_FACE = 'input_face',
  INPUT_OUTFIT = 'input_outfit',
  LOADING = 'loading',
  RESULT = 'result'
}

export type UserChoice = 'photo' | 'model' | 'occasion' | 'jewellery';

export interface ModelDescription {
  gender: 'Female' | 'Male';
  age: string;
  skinTone: string;
  faceShape: string;
  facialFullness: string;
  bodyType: string;
  bodyFat: string;
  hairLength: string;
  hairTexture: string;
  hairColor: string;
  hairCondition?: string;
  eyesShape: string;
  eyeColor: string;
  noseShape: string;
  lipsShape: string;
  beardType?: string; // Optional, only for Male
  headwear?: string; // Optional, only for Male
}

export interface ImageFile {
  file: File;
  base64: string;
  mimeType: string;
}

export interface WeddingContext {
  religion?: string;
  region?: string;
}

export interface StyleRequest extends WeddingContext {
  userChoice: 'photo' | 'model';
  userImage: ImageFile | null;
  modelDescription: ModelDescription | null;
  hairLength?: string;
  
  topWearImage: ImageFile | null; // This will now serve for Top Wear OR Full Outfit
  topWearType: string | null; // This will now include full outfit types
  topWearMaterial: string | null;
  blouseImage?: ImageFile | null;

  bottomWearImage: ImageFile | null; // Will be null if topWearType is a full outfit
  bottomWearType: string | null;
  bottomWearMaterial: string | null;
  jeanStyle?: string;
  
  occasion: string;
  timeOfDay: string;
  venue: string;
  hairStylePreference?: string;
}

export interface OccasionStyleRequest extends WeddingContext {
  userChoice: 'occasion';
  clothingImages: ImageFile[];
  occasion: string;
  timeOfDay: string;
  venue: string;
  gender: 'Female' | 'Male';
  hairLength: string;
}

export interface JewelleryStyleRequest extends WeddingContext {
  userChoice: 'jewellery';
  userOutfitImage: ImageFile;
  jewelleryOptions: [ImageFile, ImageFile];
  occasion: string;
  timeOfDay: string;
  venue: string;
}

export interface StyleAdvice {
  makeupIdeas: string[];
  outfitPairing: string;
  accessories: {
    jewelry: string[];
    footwear: string[];
    bag: string;
  };
  hairstyles: string[];
  finalLookDescription: string;
}

export interface StyleResult {
  advice: StyleAdvice;
  imageUrl: string | null;
  reasoning?: string;
  chosenItemImageUrl?: string;
  occasion?: string;
}