import { StyleRequest, StyleResult, OccasionStyleRequest, ImageFile, ModelDescription, JewelleryStyleRequest } from '../types';
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

// Ensure API key is present
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.error("VITE_GEMINI_API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || '' });

/* ---------------------
   Utility helpers
   --------------------- */
const fileToGenerativePart = (image: ImageFile) => ({
  inlineData: { data: image.base64, mimeType: image.mimeType },
});

const runWithTimeout = <T>(promiseFn: () => Promise<T>, ms = 60000): Promise<T> => {
  let timeoutId: any;

  const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
          reject(new Error(`Model request timed out after ${ms}ms`));
      }, ms);
  });

  return Promise.race([
      promiseFn(),
      timeoutPromise,
  ]).finally(() => {
      clearTimeout(timeoutId);
  });
};

/* ---------------------
   Schemas
   --------------------- */

const faceAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    skinTone: { type: Type.STRING },
    faceShape: { type: Type.STRING },
    hairColor: { type: Type.STRING },
    hairCondition: { type: Type.STRING },
    eyesShape: { type: Type.STRING },
    eyeColor: { type: Type.STRING },
    noseShape: { type: Type.STRING },
    lipsShape: { type: Type.STRING }
  },
  required: ["skinTone", "faceShape", "hairColor", "hairCondition", "eyesShape", "eyeColor", "noseShape", "lipsShape"]
};

const styleAdviceSchema = {
    type: Type.OBJECT,
    properties: {
        finalLookDescription: { type: Type.STRING },
        makeupIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
        outfitPairing: { type: Type.STRING },
        accessories: {
            type: Type.OBJECT,
            properties: {
                jewelry: { type: Type.ARRAY, items: { type: Type.STRING } },
                footwear: { type: Type.ARRAY, items: { type: Type.STRING } },
                bag: { type: Type.STRING },
            },
            required: ["jewelry", "footwear", "bag"],
        },
        hairstyles: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["finalLookDescription", "makeupIdeas", "outfitPairing", "accessories", "hairstyles"],
};

const occasionChoiceSchema = {
    type: Type.OBJECT,
    properties: {
        reasoning: { type: Type.STRING },
        chosenOutfitIndex: { type: Type.INTEGER },
        advice: styleAdviceSchema,
    },
    required: ["reasoning", "chosenOutfitIndex", "advice"],
};

const jewelleryChoiceSchema = {
    type: Type.OBJECT,
    properties: {
        reasoning: { type: Type.STRING },
        chosenJewelleryIndex: { type: Type.INTEGER },
        advice: styleAdviceSchema,
    },
    required: ["reasoning", "chosenJewelleryIndex", "advice"],
};

/* ---------------------
   Prompt Builders
   --------------------- */

const buildFaceAnalysisPrompt = () => {
  return `Analyze the provided user's photo to determine their key physical features: Skin Tone, Face Shape, Hair Color, Hair Condition, Eye Shape, Eye Color, Nose Shape, Lips Shape. Return JSON.`;
};

const buildStylePrompt = (request: StyleRequest) => {
  let prompt = `You are Aara, an expert AI fashion stylist. Provide personalized styling advice for a ${request.occasion} at ${request.venue} during ${request.timeOfDay}.
  
  STRICT ADHERENCE REQUIRED: Your advice must be based ONLY on the provided clothing: ${request.topWearMaterial} ${request.topWearType}. ${request.bottomWearType ? `Bottom: ${request.bottomWearMaterial} ${request.bottomWearType}` : ''}
  
  Guidelines for the response:
  - outfitPairing: Focus ONLY on what to pair with the main clothing item. For example, if it's a saree, suggest blouse designs, colors, or specific patterns that would complement it.
  - makeupIdeas: Provide specific makeup suggestions (e.g., lip color, eye shadow, overall vibe) that suit the occasion and the outfit.
  - accessories: Suggest jewelry, footwear, and a bag.
  - hairstyles: Suggest 2-3 hairstyle options.
  - finalLookDescription: A cohesive summary of the entire look.
  `;
  if (request.hairStylePreference) {
    prompt += `\n  - Important: The user prefers their hair styled as: "${request.hairStylePreference}". Provide hairstyles and a final look that heavily feature or complement this style preference, giving variations or tips on how to style it perfectly.`;
  }
  if (request.modelDescription) {
    prompt += `Model: ${JSON.stringify(request.modelDescription)}`;
  }
  return prompt;
};

/* ---------------------
   Core model functions
   --------------------- */

export const analyzeFaceFeatures = async (
  image: ImageFile
): Promise<ModelDescription> => {

  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gemini-3.5-flash",
      contents: {
        parts: [
          { text: buildFaceAnalysisPrompt() },
          fileToGenerativePart(image),
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: faceAnalysisSchema,
      },
    }),
  });

  if (!res.ok) {
    throw new Error("Face analysis failed");
  }

  const response = await res.json();

  return JSON.parse(response.text || "{}") as ModelDescription;
};

const generateImageFromPrompt = async (promptParts: any[]): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite-image',
            contents: { parts: promptParts }
        });
        const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (part?.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
        return null;
    } catch (error) {
        console.error("Image generation failed:", error);
        return null;
    }
};

export const generateStyleAdviceAndImage = async (request: StyleRequest): Promise<StyleResult> => {
  const adviceResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [{ text: buildStylePrompt(request) }] },
      config: { responseMimeType: "application/json", responseSchema: styleAdviceSchema }
  });
  const advice = JSON.parse(adviceResponse.text || '{}');
  
  const promptParts: any[] = [];
  let imagePrompt = '';

  if (request.userChoice === 'model' && request.modelDescription) {
    const desc = request.modelDescription;
    let ageDetail = '';
    if (desc.age === '56-65') {
      ageDetail = 'a mature, older person around 60 years old. They must have realistic signs of aging like wrinkles, fine lines around the eyes, mature facial features, and a slightly weathered skin texture reflecting an age of 56 to 65. Under no circumstances should they look like a young man or a young woman.';
    } else if (desc.age === '65+') {
      ageDetail = 'an elderly, senior person over 65 years old. They must have prominent wrinkles, visible age lines, sagging/mature skin, and elder facial features reflecting a senior citizen of 65+ years. Under no circumstances should they look like a young man or a young woman.';
    } else if (desc.age === '46-55') {
      ageDetail = 'a middle-aged person around 50 years old with mature facial features, subtle age lines, and a middle-aged appearance.';
    } else {
      ageDetail = `a person of age ${desc.age}.`;
    }

    let hairDetail = `${desc.hairLength} length, ${desc.hairTexture} texture, and colored ${desc.hairColor}.`;
    if (desc.hairColor === 'Natural Black' || desc.hairColor === 'Black' || desc.hairColor === 'Dark Brown') {
      if (['56-65', '65+'].includes(desc.age)) {
        hairDetail += ` Note: although they have dyed/natural ${desc.hairColor} hair, they MUST still have the wrinkled, mature face of an elderly/mature person (do NOT make them look young).`;
      }
    }
    if (request.hairStylePreference) {
      hairDetail += ` Styled as a "${request.hairStylePreference}" hairstyle.`;
    }

    const beardDetail = desc.gender === 'Male' && desc.beardType && desc.beardType !== 'No Beard'
      ? `, with a ${desc.beardType}`
      : '';
    const headwearDetail = desc.gender === 'Male' && desc.headwear && desc.headwear !== 'None'
      ? `, wearing a ${desc.headwear}`
      : '';

    imagePrompt = `STRICT ADHERENCE REQUIRED: Generate a photorealistic, high-quality, professional fashion studio full-body portrait of ${ageDetail}
    Gender: ${desc.gender}.
    Skin Tone: ${desc.skinTone}.
    Face Shape: ${desc.faceShape}, with ${desc.facialFullness || 'average'} facial fullness.
    Body Type: ${desc.bodyType || 'average'}.
    Hair: ${hairDetail}${beardDetail}${headwearDetail}.
    Eyes: ${desc.eyesShape} shape, ${desc.eyeColor} color.
    Nose: ${desc.noseShape}.
    Lips: ${desc.lipsShape}.

    CRITICAL NATURAL FACIAL APPEARANCE REQUIREMENT: The person's face MUST look 100% natural, lifelike, and highly realistic. They should have authentic, detailed human skin textures (visible pores, subtle lines/creases, realistic shadows), a pleasant and natural human expression, and authentic human eyes. Absolutely avoid any plastic, CGI, 3D-rendered, doll-like, or overly smooth/airbrushed/artificial AI looks. The face must look like an actual, living human being from a real professional high-definition photograph.

    CRITICAL CLOTHING PRESERVATION MANDATE: The generated output MUST retain the EXACT design, shape, cuts, patterns, prints, colors, embroidery, fabrics, and textures of the uploaded clothing images. Do NOT change, simplify, or modify the outfit design. It must remain 100% true to the reference clothes.

    CRITICAL HEADROOM AND HAIRSTYLE VISIBILITY REQUIREMENT: The person's entire head, full face, and entire hairstyle must be fully visible and centered in the frame. Leave ample negative space (headroom) at the top of the image so that the hair and head are never cropped or cut off. The hairstyle should be beautifully presented and completely visible.

    They MUST be wearing the EXACT clothes shown in the clothing images provided, maintaining the exact same colors, patterns, and fabrics/textures. 
    The outfit must be styled precisely as follows: ${advice.finalLookDescription}. 
    Setting: ${request.venue}.`;
  } else {
    const hairStyleInstruct = request.hairStylePreference 
      ? `\n    The person's hair must be styled specifically as a: "${request.hairStylePreference}" hairstyle, beautifully presented and completely visible.` 
      : '';
    imagePrompt = `STRICT ADHERENCE REQUIRED: Generate a photorealistic, full-body portrait of the person from the provided photo. The final image MUST show the entire person from head to toe, with their full legs and appropriate matching footwear fully visible.${hairStyleInstruct}
    CRITICAL NATURAL FACIAL APPEARANCE REQUIREMENT: The person's face MUST look 100% natural, lifelike, and highly realistic. They should have authentic, detailed human skin textures (visible pores, subtle lines/creases, realistic shadows), a pleasant and natural human expression, and authentic human eyes. Absolutely avoid any plastic, CGI, 3D-rendered, doll-like, or overly smooth/airbrushed/artificial AI looks. The face must look like an actual, living human being from a real professional high-definition photograph.
    CRITICAL CLOTHING PRESERVATION MANDATE: The generated output MUST retain the EXACT design, shape, cuts, patterns, prints, colors, embroidery, fabrics, and textures of the uploaded clothing images. Do NOT change, simplify, or modify the outfit design. It must remain 100% true to the reference clothes.
    CRITICAL HEADROOM AND HAIRSTYLE VISIBILITY REQUIREMENT: The person's entire head, full face, and entire hairstyle must be fully visible and centered in the frame. Leave ample negative space (headroom) at the top of the image so that the hair and head are never cropped or cut off. The hairstyle should be beautifully presented and completely visible.
    They MUST be wearing the EXACT clothes shown in the clothing images provided, maintaining the same colors, patterns, and textures. 
    The person's facial features must be preserved from the reference photo.
    The outfit should be styled as follows: ${advice.finalLookDescription}. 
    Setting: ${request.venue}.`;
  }

  promptParts.push({ text: imagePrompt });

  if (request.userImage) {
    promptParts.push(fileToGenerativePart(request.userImage));
  }
  if (request.topWearImage) {
    promptParts.push(fileToGenerativePart(request.topWearImage));
  }
  if (request.bottomWearImage) {
    promptParts.push(fileToGenerativePart(request.bottomWearImage));
  }

  const imageUrl = await generateImageFromPrompt(promptParts);
  return { advice, imageUrl, occasion: request.occasion };
};

export const generateOccasionStyleAdvice = async (request: OccasionStyleRequest): Promise<StyleResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: { parts: [{ text: `STRICT ADHERENCE REQUIRED: Choose the best outfit for ${request.occasion} at ${request.venue} during ${request.timeOfDay}.
    
    Guidelines for the advice:
    - outfitPairing: Focus ONLY on what to pair with the chosen outfit.
    - makeupIdeas: Provide specific makeup suggestions.
    - accessories: Suggest jewelry, footwear, and a bag.
    - hairstyles: Suggest 2-3 hairstyle options.
    - finalLookDescription: A cohesive summary of the entire look.` }, ...request.clothingImages.map(fileToGenerativePart)] },
    config: { responseMimeType: "application/json", responseSchema: occasionChoiceSchema }
  });
  const { reasoning, chosenOutfitIndex, advice } = JSON.parse(response.text || '{}');
  
  const promptParts: any[] = [];
  const imagePrompt = `STRICT ADHERENCE REQUIRED: Generate a photorealistic, full-body portrait of a person wearing the EXACT outfit shown in the provided clothing image. The final image MUST show the entire person from head to toe, with their full legs and appropriate matching footwear fully visible.
  CRITICAL NATURAL FACIAL APPEARANCE REQUIREMENT: The person's face MUST look 100% natural, lifelike, and highly realistic. They should have authentic, detailed human skin textures (visible pores, subtle lines/creases, realistic shadows), a pleasant and natural human expression, and authentic human eyes. Absolutely avoid any plastic, CGI, 3D-rendered, doll-like, or overly smooth/airbrushed/artificial AI looks. The face must look like an actual, living human being from a real professional high-definition photograph.
  CRITICAL CLOTHING PRESERVATION MANDATE: The generated output MUST retain the EXACT design, shape, cuts, patterns, prints, colors, embroidery, fabrics, and textures of the uploaded clothing images. Do NOT change, simplify, or modify the outfit design. It must remain 100% true to the reference clothes.
  CRITICAL HEADROOM AND HAIRSTYLE VISIBILITY REQUIREMENT: The person's entire head, full face, and entire hairstyle must be fully visible and centered in the frame. Leave ample negative space (headroom) at the top of the image so that the hair and head are never cropped or cut off. The hairstyle should be beautifully presented and completely visible.
  Preserve all details of the clothing including color, material, and pattern.
  Style it as follows: ${advice.finalLookDescription}. 
  Setting: ${request.venue}.`;
  
  promptParts.push({ text: imagePrompt });
  if (request.clothingImages[chosenOutfitIndex]) {
    promptParts.push(fileToGenerativePart(request.clothingImages[chosenOutfitIndex]));
  }

  const imageUrl = await generateImageFromPrompt(promptParts);
  return { advice, reasoning, imageUrl, occasion: request.occasion };
};

export const generateJewelleryAdvice = async (request: JewelleryStyleRequest): Promise<StyleResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: { parts: [{ text: `STRICT ADHERENCE REQUIRED: Choose the best jewellery from the options for the provided outfit for ${request.occasion} at ${request.venue} during ${request.timeOfDay}.
    
    Guidelines for the advice:
    - outfitPairing: Focus ONLY on what else to pair with this outfit and jewellery.
    - makeupIdeas: Provide specific makeup suggestions.
    - accessories: Suggest footwear and a bag (jewelry is already chosen).
    - hairstyles: Suggest 2-3 hairstyle options.
    - finalLookDescription: A cohesive summary of the entire look.` }, fileToGenerativePart(request.userOutfitImage), ...request.jewelleryOptions.map(fileToGenerativePart)] },
    config: { responseMimeType: "application/json", responseSchema: jewelleryChoiceSchema }
  });
  const { reasoning, chosenJewelleryIndex, advice } = JSON.parse(response.text || '{}');
  
  const promptParts: any[] = [];
  const imagePrompt = `STRICT ADHERENCE REQUIRED: Generate a photorealistic, full-body portrait of a person wearing the outfit from the first image and the EXACT jewellery from the second image. The final image MUST show the entire person from head to toe, with their full legs and appropriate matching footwear fully visible. 
  CRITICAL NATURAL FACIAL APPEARANCE REQUIREMENT: The person's face MUST look 100% natural, lifelike, and highly realistic. They should have authentic, detailed human skin textures (visible pores, subtle lines/creases, realistic shadows), a pleasant and natural human expression, and authentic human eyes. Absolutely avoid any plastic, CGI, 3D-rendered, doll-like, or overly smooth/airbrushed/artificial AI looks. The face must look like an actual, living human being from a real professional high-definition photograph.
  CRITICAL CLOTHING PRESERVATION MANDATE: The generated output MUST retain the EXACT design, shape, cuts, patterns, prints, colors, embroidery, fabrics, and textures of the uploaded clothing images. Do NOT change, simplify, or modify the outfit design. It must remain 100% true to the reference clothes.
  CRITICAL HEADROOM AND HAIRSTYLE VISIBILITY REQUIREMENT: The person's entire head, full face, and entire hairstyle must be fully visible and centered in the frame. Leave ample negative space (headroom) at the top of the image so that the hair and head are never cropped or cut off. The hairstyle should be beautifully presented and completely visible.
  Preserve all details of both the outfit and the jewellery.
  Style it as follows: ${advice.finalLookDescription}. 
  Setting: ${request.venue}.`;
  
  promptParts.push({ text: imagePrompt });
  promptParts.push(fileToGenerativePart(request.userOutfitImage));
  if (request.jewelleryOptions[chosenJewelleryIndex]) {
    promptParts.push(fileToGenerativePart(request.jewelleryOptions[chosenJewelleryIndex]));
  }

  const imageUrl = await generateImageFromPrompt(promptParts);
  return { advice, reasoning, imageUrl, occasion: request.occasion };
};

