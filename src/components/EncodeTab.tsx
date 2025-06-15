import React, { useState, useContext, useRef } from 'react';
import { Upload, Lock, Info, AlertCircle, Download, FileCheck, Loader } from 'lucide-react';
import ImageUploader from './ImageUploader';
import ThemeContext from '../context/ThemeContext';
import { encodeMessage, calculateImageCapacity } from '../utils/steganography';
import Tooltip from './Tooltip';

const EncodeTab = () => {
  const { darkMode } = useContext(ThemeContext);
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [outputImageUrl, setOutputImageUrl] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [capacity, setCapacity] = useState<{ total: number; used: number; percentage: number } | null>(null);
  const [encoding, setEncoding] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Image size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        setOriginalImageUrl(e.target.result as string);
        setOutputImageUrl(null);
        setSuccess(false);
        setError(null);
        
        try {
          const capacity = await calculateImageCapacity(e.target.result as string);
          setCapacity(capacity);
        } catch (err) {
          setError('Failed to calculate image capacity');
        }
      }
    };
    reader.readAsDataURL(file);
    setOriginalImage(file);
  };
  
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    
    if (capacity) {
      const used = newMessage.length;
      const percentage = Math.min(100, Math.round((used / capacity.total) * 100));
      setCapacity({
        ...capacity,
        used,
        percentage
      });
    }
  };
  
  const handleEncode = async () => {
    if (!originalImage || !message.trim()) {
      setError('Please upload an image and enter a message to hide.');
      return;
    }
    
    if (capacity && capacity.used > capacity.total) {
      setError('Message is too large for this image. Please use a larger image or shorter message.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setEncoding(true);
    setProgress(0);
    
    try {
      const result = await encodeMessage(
        originalImageUrl!,
        message,
        password,
        (progress) => setProgress(Math.round(progress * 100))
      );
      setOutputImageUrl(result);
      setSuccess(true);
    } catch (err) {
      setError('Failed to encode message: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
      setEncoding(false);
    }
  };
  
  const handleDownload = () => {
    if (!outputImageUrl) return;
    
    const link = document.createElement('a');
    link.href = outputImageUrl;
    link.download = `stego-${originalImage?.name || 'image.png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white shadow-md'} p-6`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">1. Select an Image</h2>
          <ImageUploader 
            onImageUpload={handleImageUpload} 
            imageUrl={originalImageUrl}
            fileInputRef={fileInputRef}
            maxSize={10 * 1024 * 1024} // 10MB
          />
          
          {capacity && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Image capacity</span>
                <span className={capacity.percentage > 90 ? 'text-red-400' : ''}>
                  {capacity.used.toLocaleString()} / {capacity.total.toLocaleString()} bytes
                </span>
              </div>
              <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    capacity.percentage > 90 ? 'bg-red-500' : 'bg-purple-500'
                  }`} 
                  style={{ width: `${capacity.percentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">2. Enter Your Secret Message</h2>
          <div className="mb-4">
            <textarea 
              className={`w-full px-4 py-3 rounded-lg ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
              } border focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="Enter the secret message you want to hide in the image..."
              rows={5}
              value={message}
              onChange={handleMessageChange}
              maxLength={capacity?.total || undefined}
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label className="flex items-center text-sm font-medium mb-2">
              <Lock className="w-4 h-4 mr-1" />
              Password (Optional)
              <Tooltip content="Adding a password encrypts your message for extra security">
                <Info className="w-4 h-4 ml-1 text-gray-400" />
              </Tooltip>
            </label>
            <input
              type="password"
              className={`w-full px-4 py-2 rounded-lg ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
              } border focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="Add a password for encryption"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            } ${
              darkMode 
                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
            onClick={handleEncode}
            disabled={loading || !originalImage || !message.trim()}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </span>
            ) : (
              'Hide Message in Image'
            )}
          </button>
          
          {encoding && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Encoding progress</span>
                <span>{progress}%</span>
              </div>
              <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div 
                  className="h-full rounded-full bg-green-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-4 px-4 py-3 rounded-lg bg-red-500 bg-opacity-20 text-red-400 flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
      
      {success && outputImageUrl && (
        <div className="mt-8">
          <div className="border-t border-b py-4 mb-4 border-opacity-20">
            <h2 className="text-xl font-semibold mb-4">Result</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium mb-2 opacity-70">Original Image</p>
                <div className={`rounded-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <img src={originalImageUrl!} alt="Original" className="w-full h-auto" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2 opacity-70">Image with Hidden Message</p>
                <div className={`rounded-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <img src={outputImageUrl} alt="With hidden message" className="w-full h-auto" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              className={`py-3 px-6 rounded-lg font-medium transition-colors flex items-center ${
                darkMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
              onClick={handleDownload}
            >
              <Download className="w-5 h-5 mr-2" />
              Download Image with Hidden Message
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EncodeTab;