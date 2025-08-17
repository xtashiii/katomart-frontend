'use client';

import { useState, ReactNode } from 'react';

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
      <div className="flex border-b border-gray-300">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            disabled={tab.disabled}
            onClick={() => onTabChange(tab.id)}
            className={`py-2 px-4 text-sm font-medium text-center border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}
