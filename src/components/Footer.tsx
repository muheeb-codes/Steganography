import React, { useContext } from 'react';
import { Heart, Shield } from 'lucide-react';
import ThemeContext from '../context/ThemeContext';

const Footer = () => {
  const { darkMode } = useContext(ThemeContext);
  
  return (
    <footer className={`py-6 ${darkMode ? 'bg-gray-800' : 'bg-white shadow-inner'}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center mb-2">
            <Shield className="w-5 h-5 text-purple-500 mr-2" />
            <span className="font-semibold">Stealth Pixel</span>
          </div>
          
          <p className="text-sm opacity-70 text-center mb-4">
            Your privacy matters. All processing happens in your browser.
            No images or data are ever sent to a server.
          </p>
          
          <div className="flex items-center text-sm opacity-70">
            <span>Made with</span>
            <Heart className="w-4 h-4 mx-1 text-red-500" />
            <span>using React & Tailwind</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;