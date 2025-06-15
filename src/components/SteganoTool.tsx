import React, { useState } from 'react';
import EncodeTab from './EncodeTab';
import DecodeTab from './DecodeTab';
import TabSelector from './TabSelector';

type TabType = 'encode' | 'decode';

const SteganoTool = () => {
  const [activeTab, setActiveTab] = useState<TabType>('encode');

  return (
    <div className="w-full max-w-5xl mx-auto">
      <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="mt-6">
        {activeTab === 'encode' ? (
          <EncodeTab />
        ) : (
          <DecodeTab />
        )}
      </div>
    </div>
  );
};

export default SteganoTool;