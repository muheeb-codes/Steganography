import React, { useContext } from 'react';
import { Upload, Image } from 'lucide-react';
import ThemeContext from '../context/ThemeContext';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  imageUrl: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  maxSize?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUpload, 
  imageUrl,
  fileInputRef,
  maxSize = 5 * 1024 * 1024 // Default 5MB
}) => {
  const { darkMode } = useContext(ThemeContext);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > maxSize) {
        alert(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
        return;
      }
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        onImageUpload(file);
      } else {
        alert('Please select a JPEG or PNG image.');
      }
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('border-purple-500');
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-purple-500');
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-purple-500');
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.size > maxSize) {
        alert(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
        return;
      }
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        onImageUpload(file);
      } else {
        alert('Please select a JPEG or PNG image.');
      }
    }
  };
  
  return (
    <div className="mb-4">
      <input
        type="file"
        accept="image/jpeg, image/png"
        className="hidden"
        onChange={handleFileChange}
        ref={fileInputRef}
      />
      
      {!imageUrl ? (
        <div 
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200 
            ${darkMode 
              ? 'border-gray-600 hover:border-purple-500 bg-gray-700 bg-opacity-30' 
              : 'border-gray-300 hover:border-purple-400 bg-gray-50'
            }
          `}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
          <p className="text-base mb-1">Drag and drop an image here</p>
          <p className="text-sm opacity-60 mb-4">or click to browse</p>
          <p className="text-xs opacity-50">PNG, JPEG only (max {Math.round(maxSize / (1024 * 1024))}MB)</p>
        </div>
      ) : (
        <div className="relative group">
          <div className={`rounded-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <img 
              src={imageUrl} 
              alt="Selected" 
              className="w-full h-auto max-h-64 object-contain"
            />
          </div>
          <button
            className={`absolute top-2 right-2 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
              darkMode ? 'bg-gray-800 bg-opacity-70' : 
              'bg-white bg-opacity-70'
            } hover:bg-opacity-100`}
            onClick={() => fileInputRef.current?.click()}
            title="Change image"
          >
            <Image className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;