'use client';

import { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div>
      <div className="flex justify-between border-b-2 border-gray-200 bg-gray-50 rounded-t-lg overflow-hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            disabled={tab.disabled}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 py-3 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-center border-b-3 transition-all duration-200 ${
              activeTab === tab.id
                ? 'border-primary text-primary bg-white shadow-sm'
                : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100 hover:border-gray-300'
            } disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600`}
          >
            <span className="block truncate leading-tight">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="bg-white rounded-b-lg border-x-2 border-b-2 border-gray-200">
        <div className="p-4 sm:p-6">
          {tabs.find((tab) => tab.id === activeTab)?.content}
        </div>
      </div>
    </div>
  );
}
