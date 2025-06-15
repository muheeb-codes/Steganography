import React, { useState } from 'react';
import { Shield, Upload, Download, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import Header from './components/Header';
import SteganoTool from './components/SteganoTool';
import Footer from './components/Footer';
import ThemeContext from './context/ThemeContext';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="flex items-center justify-center space-x-4 mb-2">
              <Shield className="w-8 h-8 text-purple-500" />
              <h1 className="text-3xl font-bold">Stealth Pixel</h1>
            </div>
            <p className="text-center text-lg max-w-2xl opacity-80">
              Hide secret messages and files within images using advanced steganography techniques.
              All processing happens in your browser for complete privacy.
            </p>
          </div>
          
          <SteganoTool />
        </main>
        <Footer />
      </div>
    </ThemeContext.Provider>
  );
}

export default App;