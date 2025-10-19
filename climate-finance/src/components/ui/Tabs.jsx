import React, { useState } from 'react';

const Tabs = ({
  tabs = [],
  defaultTab = null,
  onChange,
  className = '',
  variant = 'default' // 'default' | 'pills' | 'cards'
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.key);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    onChange?.(tabKey);
  };

  const getTabStyles = () => {
    switch (variant) {
      case 'pills':
        return {
          container: 'flex gap-2 mb-6',
          tab: (isActive) => `
            px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
            ${isActive 
              ? 'bg-purple-600 text-white shadow-sm' 
              : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
            }
          `,
          content: ''
        };
      case 'cards':
        return {
          container: 'flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg',
          tab: (isActive) => `
            flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 text-center
            ${isActive 
              ? 'bg-white text-purple-600 shadow-sm' 
              : 'text-gray-600 hover:text-purple-600'
            }
          `,
          content: ''
        };
      default:
        return {
          container: 'border-b border-gray-200 mb-6',
          tab: (isActive) => `
            inline-block py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 mr-6
            ${isActive 
              ? 'border-purple-600 text-purple-600' 
              : 'border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-300'
            }
          `,
          content: ''
        };
    }
  };

  const styles = getTabStyles();

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className={styles.container}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={styles.tab(activeTab === tab.key)}
            onClick={() => handleTabChange(tab.key)}
            disabled={tab.disabled}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
            {tab.badge && <span className="ml-2">{tab.badge}</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.content}>
        {tabs.map((tab) => (
          <div
            key={tab.key}
            className={`${activeTab === tab.key ? 'block' : 'hidden'}`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;