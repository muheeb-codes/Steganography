import React, { useContext } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import ThemeContext from '../context/ThemeContext';

interface TabSelectorProps {
  activeTab: 'encode' | 'decode';
  setActiveTab: (tab: 'encode' | 'decode') => void;
}

const TabSelector: React.FC<TabSelectorProps> = ({ activeTab, setActiveTab }) => {
  const { darkMode } = useContext(ThemeContext);
  
  return (
    <div className={`flex rounded-lg p-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
      <button
        className={`flex items-center justify-center flex-1 py-3 px-4 rounded-md font-medium transition-all ${
          activeTab === 'encode'
            ? darkMode 
              ? 'bg-gray-700 text-purple-400 shadow-sm' 
              : 'bg-white text-purple-600 shadow-sm'
            : 'hover:bg-opacity-10 hover:bg-gray-700'
        }`}
        onClick={() => setActiveTab('encode')}
      >
        <EyeOff className="w-5 h-5 mr-2" />
        Hide Data
      </button>
      
      <button
        className={`flex items-center justify-center flex-1 py-3 px-4 rounded-md font-medium transition-all ${
          activeTab === 'decode'
            ? darkMode 
              ? 'bg-gray-700 text-purple-400 shadow-sm' 
              : 'bg-white text-purple-600 shadow-sm'
            : 'hover:bg-opacity-10 hover:bg-gray-700'
        }`}
        onClick={() => setActiveTab('decode')}
      >
        <Eye className="w-5 h-5 mr-2" />
        Reveal Data
      </button>
    </div>
  );
};

export default TabSelector;