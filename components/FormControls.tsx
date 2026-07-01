import React from 'react';
import { ModelDescription } from '../types';

export const SelectInput: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[], name: string, id: string}> = ({label, value, onChange, options, name, id}) => {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select id={id} name={name} value={value} onChange={onChange} className="w-full p-2 border border-orange-200 rounded-lg bg-white focus:ring-teal-500 focus:border-teal-500 transition text-gray-800">
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    )
}

export const RadioPill: React.FC<{name: string, value: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, label: string}> = ({ name, value, checked, onChange, label }) => {
    const id = `${name}-${value.toLowerCase().replace(/[^\w-]+/g, '')}`;
    return (
        <label htmlFor={id} className={`cursor-pointer px-4 py-2 rounded-full text-sm font-semibold transition-colors ${checked ? 'bg-teal-600 text-white' : 'bg-white hover:bg-orange-100'}`}>
            <input id={id} type="radio" name={name} value={value} checked={checked} onChange={onChange} className="hidden" />
            {label}
        </label>
    );
}

export const ModelCreator: React.FC<{modelDescription: ModelDescription, setModelDescription: React.Dispatch<React.SetStateAction<ModelDescription>>}> = ({ modelDescription, setModelDescription }) => {
    const maleHairOptions = ["Short", "Medium", "Long", "Bald", "Classic Taper", "Crew Cut", "Undercut", "Slicked Back", "Man Bun", "Textured Crop"];
    const femaleHairOptions = ["Short", "Medium", "Long", "Bob cut", "Bald"];
    const femaleBodyTypes = ["Hourglass", "Rectangle", "Triangle (Pear)", "Inverted Triangle (Apple)", "Round", "Round (Plus-Size)"];
    const maleBodyTypes = ["Ectomorph (Slim)", "Mesomorph (Athletic)", "Endomorph (Heavyset)", "Rectangle", "Trapezoid"];
    
    const getHairColorOptions = (age: string): string[] => {
        const youngColors = ["Natural Black", "Dark Brown", "Light Brown", "Burgundy"];
        const matureColors = ["Salt and Pepper", "Fully Grey", "White"];
        if (["46-55", "56-65", "65+"].includes(age)) {
            return [...youngColors, ...matureColors];
        }
        return youngColors;
    };

    const hairColorOptions = getHairColorOptions(modelDescription.age);

    const handleFieldChange = (field: keyof ModelDescription, value: string) => {
        setModelDescription(prev => {
            const newState = { ...prev, [field]: value };
            if (field === 'gender') {
                if (value === 'Female') {
                    delete newState.beardType;
                    delete newState.headwear;
                    if (!femaleHairOptions.includes(newState.hairLength)) {
                        newState.hairLength = 'Long';
                    }
                    if (!femaleBodyTypes.includes(newState.bodyType)) {
                        newState.bodyType = 'Hourglass';
                    }
                } else if (value === 'Male') {
                    if (!newState.beardType) newState.beardType = "No Beard";
                    if (!newState.headwear) newState.headwear = "None";
                    if (!maleHairOptions.includes(newState.hairLength)) {
                        newState.hairLength = 'Short';
                    }
                    if (!maleBodyTypes.includes(newState.bodyType)) {
                        newState.bodyType = 'Mesomorph (Athletic)';
                    }
                }
            }
            if (field === 'age') {
                const newHairOptions = getHairColorOptions(value);
                if (!newHairOptions.includes(newState.hairColor)) {
                    newState.hairColor = newHairOptions[0]; // Reset to default if current color is not valid
                }
            }
            return newState;
        });
    };
    
    return (
        <div className="space-y-4 p-4 bg-orange-50/50 rounded-xl">
             <h3 className="text-lg font-semibold text-teal-800 mb-3">Create Your AI Model</h3>
             
             <fieldset>
                <div className="flex gap-4">
                    <RadioPill name="gender" value="Female" checked={modelDescription.gender === 'Female'} onChange={(e) => handleFieldChange('gender', e.target.value)} label="Female" />
                    <RadioPill name="gender" value="Male" checked={modelDescription.gender === 'Male'} onChange={(e) => handleFieldChange('gender', e.target.value)} label="Male" />
                </div>
             </fieldset>
            
             <fieldset className="border-t border-orange-200 pt-4">
                <legend className="text-sm font-semibold text-teal-700 px-2 -ml-2">Core Features</legend>
                <div className="space-y-3 pt-2">
                    <SelectInput id="age" name="age" label="Age Range" value={modelDescription.age} onChange={e => handleFieldChange('age', e.target.value)} options={["18-25", "26-35", "36-45", "46-55", "56-65", "65+"]} />
                    <SelectInput id="skin-tone" name="skin-tone" label="Skin Tone" value={modelDescription.skinTone} onChange={e => handleFieldChange('skinTone', e.target.value)} options={["Light Fair", "Fair", "Warm Wheatish", "Tan", "Deep Brown", "Deep Espresso", "Rich Ebony"]} />
                    <SelectInput id="body-type" name="body-type" label="Body Type" value={modelDescription.bodyType} onChange={e => handleFieldChange('bodyType', e.target.value)} options={modelDescription.gender === 'Male' ? maleBodyTypes : femaleBodyTypes} />
                    <SelectInput id="body-fat" name="body-fat" label="Body Shape Details" value={modelDescription.bodyFat} onChange={e => handleFieldChange('bodyFat', e.target.value)} options={["None", "Belly Fat", "Hip & Thigh Fat", "Fuller Arms", "Overall Softness"]} />
                </div>
             </fieldset>

             <fieldset className="border-t border-orange-200 pt-4">
                <legend className="text-sm font-semibold text-teal-700 px-2 -ml-2">Hair Details</legend>
                 <div className="space-y-3 pt-2">
                    <SelectInput id="hair-length" name="hair-length" label="Hair Length" value={modelDescription.hairLength} onChange={e => handleFieldChange('hairLength', e.target.value)} options={modelDescription.gender === 'Male' ? maleHairOptions : femaleHairOptions} />
                    {modelDescription.hairLength && modelDescription.hairLength !== 'Bald' && (
                        <div className="animate-fade-in">
                            <SelectInput id="hair-texture" name="hair-texture" label="Hair Texture" value={modelDescription.hairTexture} onChange={e => handleFieldChange('hairTexture', e.target.value)} options={["Straight", "Wavy", "Curly", "Coily", "Straight and Curly Combination"]} />
                        </div>
                    )}
                    <SelectInput id="hair-color" name="hair-color" label="Hair Color" value={modelDescription.hairColor} onChange={e => handleFieldChange('hairColor', e.target.value)} options={hairColorOptions} />
                 </div>
             </fieldset>

             <fieldset className="border-t border-orange-200 pt-4">
                <legend className="text-sm font-semibold text-teal-700 px-2 -ml-2">Facial Details</legend>
                 <div className="space-y-3 pt-2">
                    <SelectInput id="face-shape" name="face-shape" label="Face Shape" value={modelDescription.faceShape} onChange={e => handleFieldChange('faceShape', e.target.value)} options={["Oval", "Round", "Square", "Heart", "Long"]} />
                    <SelectInput id="facial-fullness" name="facial-fullness" label="Facial Fullness" value={modelDescription.facialFullness} onChange={e => handleFieldChange('facialFullness', e.target.value)} options={["Average", "Full or chubby cheeks", "Hollow or sunken cheeks", "Muscular jaw", "Defined jawline"]} />
                    <SelectInput id="eye-shape" name="eye-shape" label="Eye Shape" value={modelDescription.eyesShape} onChange={e => handleFieldChange('eyesShape', e.target.value)} options={["Almond", "Round", "Hooded", "Upturned", "Downturned", "Monolid", "Double Monolid"]} />
                    <SelectInput id="eye-color" name="eye-color" label="Eye Color" value={modelDescription.eyeColor} onChange={e => handleFieldChange('eyeColor', e.target.value)} options={["Dark Brown", "Brown", "Light Brown", "Hazel", "Black"]} />
                    <SelectInput id="nose-shape" name="nose-shape" label="Nose Shape" value={modelDescription.noseShape} onChange={e => handleFieldChange('noseShape', e.target.value)} options={["Aquiline (Sharp)", "Button (Rounded)", "Broad", "Snub (Short & Upturned)", "Straight and Flat"]} />
                    <SelectInput id="lips-shape" name="lips-shape" label="Lips Shape" value={modelDescription.lipsShape} onChange={e => handleFieldChange('lipsShape', e.target.value)} options={["Full", "Thin", "Heart-shaped", "Wide", "Fuller Upper, Thinner Lower", "Thinner Upper, Fuller Lower", "Cupid's Bow", "Downturned Lips"]} />
                    
                    {modelDescription.gender === 'Male' && (
                        <div className="animate-fade-in space-y-3 pt-3">
                            <SelectInput id="beard-type" name="beard-type" label="Beard Type" value={modelDescription.beardType || 'No Beard'} onChange={e => handleFieldChange('beardType', e.target.value)} options={["No Beard", "Light Stubble", "Trimmed Beard", "Full Beard", "Goatee"]} />
                            <SelectInput id="headwear" name="headwear" label="Headwear" value={modelDescription.headwear || 'None'} onChange={e => handleFieldChange('headwear', e.target.value)} options={["None", "Turban (Sikh Style)", "Groom's Safa/Pagdi", "Turban (Rajasthani Style)"]} />
                        </div>
                    )}
                 </div>
             </fieldset>
        </div>
    )
}