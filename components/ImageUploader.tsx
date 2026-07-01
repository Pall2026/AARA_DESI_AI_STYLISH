import React, { useState, useRef, useEffect } from 'react';
import { ImageFile } from '../types';
import { PhotoIcon, XMarkIcon, CameraLiveIcon, CameraBlockedIcon, HeadOutlineIcon } from './icons';

export interface ImageUploaderProps {
  id: string;
  name: string;
  label?: string;
  image: ImageFile | null;
  description?: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageCapture?: (file: ImageFile) => void;
  onRemove: () => void;
  allowLivePhoto?: boolean;
  disabled?: boolean;
  aspectRatio?: 'portrait' | 'square';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, name, label, image, description, onImageChange, onImageCapture, onRemove, allowLivePhoto, disabled = false, aspectRatio = 'square' }) => {
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const containerClass = aspectRatio === 'portrait' ? 'aspect-[3/4] max-w-sm mx-auto' : 'h-48';

    const stopCamera = () => {
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
      }
    };

    const handleLivePhotoClick = () => {
      if (disabled) return;
      setCameraError(null);
      setIsCameraOpen(true);
    };

    const handleCapture = () => {
      const video = videoRef.current;
      if (video && onImageCapture) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64String = reader.result?.toString().split(',')[1];
                if (base64String) {
                  onImageCapture({
                    file,
                    base64: base64String,
                    mimeType: file.type
                  });
                }
              };
              reader.readAsDataURL(file);
            }
          }, 'image/jpeg');
        }
      }
      setIsCameraOpen(false);
    };
    
    useEffect(() => {
        if (isCameraOpen) {
            let streamIsActive = true;
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: true })
                    .then(stream => {
                        if (streamIsActive && videoRef.current) {
                            streamRef.current = stream;
                            videoRef.current.srcObject = stream;
                        } else {
                            stream.getTracks().forEach(track => track.stop());
                        }
                    })
                    .catch(err => {
                        console.error("Error accessing camera:", err);
                        if (streamIsActive) {
                            if (err instanceof DOMException) {
                                if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                                    setCameraError("Camera access denied. To use this feature, please allow camera access in your browser's site settings.");
                                } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                                    setCameraError("No camera was found on your device. Please ensure a camera is connected.");
                                } else {
                                    setCameraError("Could not access camera. Please check permissions and try again.");
                                }
                            } else {
                                setCameraError("An unknown error occurred while trying to access the camera.");
                            }
                            setIsCameraOpen(false);
                        }
                    });
            } else {
                setCameraError("Your browser does not support camera access.");
                setIsCameraOpen(false);
            }

            return () => {
                streamIsActive = false;
                stopCamera();
            };
        }
    }, [isCameraOpen]);

    const uploaderContentClass = `w-full ${containerClass} border-2 border-dashed border-orange-300 rounded-xl flex flex-col items-center justify-center text-center p-4 transition-colors ${disabled ? 'bg-gray-100' : 'bg-orange-50/50 hover:bg-orange-100/50'}`;

    return (
        <div className={`space-y-2 transition-opacity duration-300 ${disabled ? 'opacity-50' : ''}`}>
            {label && <label htmlFor={id} className="block text-lg font-semibold text-teal-800">{label}</label>}
            {image ? (
                <div className={`relative group w-full ${containerClass} rounded-xl shadow-md overflow-hidden`}>
                    <img src={URL.createObjectURL(image.file)} alt="Preview" className="w-full h-full object-cover" />
                    <button onClick={() => { onRemove(); setIsCameraOpen(false); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
            ) : isCameraOpen ? (
                <div className={`w-full ${containerClass} rounded-xl flex flex-col items-center justify-center text-center p-0 overflow-hidden relative bg-black`}>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    {aspectRatio === 'portrait' &&
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <HeadOutlineIcon className="w-3/4 h-3/4 text-white/40" />
                        </div>
                    }
                    <div className="absolute bottom-4 flex items-center gap-4 z-10">
                        <button onClick={() => { setIsCameraOpen(false); }} className="text-white font-semibold py-2 px-4 rounded-full bg-black/30 hover:bg-black/50 transition">Cancel</button>
                        <button onClick={handleCapture} className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center ring-2 ring-white ring-offset-2 ring-offset-black/30 hover:bg-white transition" aria-label="Capture photo">
                            <div className="h-14 w-14 rounded-full bg-white ring-2 ring-black/50"></div>
                        </button>
                    </div>
                </div>
            ) : (
            <div className={uploaderContentClass}>
                {cameraError ? (
                     <div className="flex flex-col items-center justify-center gap-2">
                        <CameraBlockedIcon className="h-12 w-12 text-red-400" />
                        <p className="font-semibold text-red-500">Camera Unavailable</p>
                        <p className="text-sm text-gray-600 max-w-xs">{cameraError}</p>
                        <button onClick={() => setCameraError(null)} className="mt-2 bg-teal-100 text-teal-700 font-semibold py-2 px-4 rounded-full hover:bg-teal-200 transition-colors">
                            Try Again
                        </button>
                    </div>
                ) : (
                    <>
                        <PhotoIcon className="h-12 w-12 text-orange-400 mb-2" />
                        <div className="flex flex-wrap justify-center gap-3">
                            <label htmlFor={id} className={`font-semibold py-2 px-4 rounded-full transition-colors ${disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'cursor-pointer bg-orange-100 text-orange-700 hover:bg-orange-200'}`}>
                                Choose File
                            </label>
                            {allowLivePhoto && onImageCapture &&
                                <button onClick={handleLivePhotoClick} disabled={disabled} className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-full transition-colors ${disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'cursor-pointer bg-teal-100 text-teal-700 hover:bg-teal-200'}`}>
                                    <CameraLiveIcon className="h-5 w-5" /> Take Photo
                                </button>
                            }
                        </div>
                        {description && <p className="text-xs text-gray-600 mt-2 text-center px-2">{description}</p>}
                        <p className="text-xs text-gray-500 mt-1">PNG or JPG, max 4MB</p>
                    </>
                )}
                <input id={id} name={name} type="file" accept="image/png, image/jpeg" className="hidden" onChange={onImageChange} disabled={disabled} />
            </div>
            )}
        </div>
    )
}
