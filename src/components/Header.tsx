import React, { useContext } from 'react';
import { Moon, Sun, Shield } from 'lucide-react';
import ThemeContext from '../context/ThemeContext';

const Header = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  
  return (
    <header className={`py-4 px-6 ${darkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Shield className="w-6 h-6 text-purple-500 mr-2" />
          <span className="font-bold text-xl">Stealth Pixel</span>
        </div>
        
        <button 
          onClick={toggleTheme}
          className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};

export default Header;