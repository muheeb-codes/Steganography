import React, { useState, useContext, useRef } from 'react';
import { Upload, Lock, AlertCircle, Copy, Loader } from 'lucide-react';
import ImageUploader from './ImageUploader';
import ThemeContext from '../context/ThemeContext';
import { decodeMessage } from '../utils/steganography';

const DecodeTab = () => {
  const { darkMode } = useContext(ThemeContext);
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedMessage, setExtractedMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [decoding, setDecoding] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Image size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageUrl(e.target.result as string);
        setExtractedMessage(null);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
    setImage(file);
  };
  
  const handleDecode = async () => {
    if (!imageUrl) {
      setError('Please upload an image first.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setCopied(false);
    setDecoding(true);
    setProgress(0);
    
    try {
      const message = await decodeMessage(
        imageUrl,
        password,
        (progress) => setProgress(Math.round(progress * 100))
      );
      if (message) {
        setExtractedMessage(message);
      } else {
        setError('No hidden message found in this image, or the password is incorrect.');
      }
    } catch (err) {
      setError('Failed to decode message: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
      setDecoding(false);
    }
  };
  
  const copyToClipboard = () => {
    if (extractedMessage) {
      navigator.clipboard.writeText(extractedMessage).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };
  
  return (
    <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white shadow-md'} p-6`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">1. Upload Image with Hidden Data</h2>
          <ImageUploader 
            onImageUpload={handleImageUpload} 
            imageUrl={imageUrl}
            fileInputRef={fileInputRef}
            maxSize={10 * 1024 * 1024} // 10MB
          />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">2. Extract Hidden Message</h2>
          
          <div className="mb-6">
            <label className="flex items-center text-sm font-medium mb-2">
              <Lock className="w-4 h-4 mr-1" />
              Password (If required)
            </label>
            <input
              type="password"
              className={`w-full px-4 py-2 rounded-lg ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
              } border focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="Enter password if the message was encrypted"
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
            onClick={handleDecode}
            disabled={loading || !imageUrl}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Extracting...
              </span>
            ) : (
              'Extract Hidden Message'
            )}
          </button>
          
          {decoding && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Decoding progress</span>
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
      
      {extractedMessage && (
        <div className="mt-8">
          <div className="border-t border-b py-4 border-opacity-20">
            <h2 className="text-xl font-semibold mb-4">Extracted Message</h2>
            <div className={`relative rounded-lg p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {extractedMessage}
              </pre>
              
              <button 
                onClick={copyToClipboard}
                className={`absolute top-2 right-2 p-2 rounded-md transition-colors ${
                  darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                }`}
                title="Copy to clipboard"
              >
                <Copy className="w-5 h-5" />
              </button>
              
              {copied && (
                <div className="absolute -top-10 right-0 px-3 py-1 bg-green-500 text-white text-sm rounded">
                  Copied!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DecodeTab;