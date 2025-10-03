import { useState } from 'react';
import platform from '../../../utils/platform';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const VALID_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

/**
 * Custom hook for handling photo upload with validation
 * Supports web file picker (mobile picker is tech debt)
 */
export const usePhotoUpload = () => {
  const [photo, setPhoto] = useState(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const clearPhoto = () => {
    setPhoto(null);
    setPhotoError('');
  };

  const validateFile = (file) => {
    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, GIF, or WebP)';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Image size must be less than 5MB';
    }
    return null;
  };

  const processWebPhoto = (file) => {
    const error = validateFile(file);
    if (error) {
      setPhotoError(error);
      return;
    }

    setIsProcessingPhoto(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      setPhoto(e.target.result);
      setIsProcessingPhoto(false);
      setPhotoError('');
    };

    reader.onerror = () => {
      setPhotoError('Failed to read image file');
      setIsProcessingPhoto(false);
    };

    reader.readAsDataURL(file);
  };

  const handlePhotoPicker = () => {
    setPhotoError('');

    if (platform.isWeb) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          processWebPhoto(file);
        }
      };
      input.click();
    } else {
      // TECH DEBT: Mobile photo picker not yet implemented
      setPhotoError(
        'Photo selection is currently only available on web. You can add photos later.'
      );
    }
  };

  return {
    photo,
    isProcessingPhoto,
    photoError,
    handlePhotoPicker,
    clearPhoto,
  };
};
