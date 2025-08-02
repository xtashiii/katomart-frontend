'use client';

import React from 'react';
import Header from '@/components/Header';
import DocumentationNav from '@/components/DocumentationNav';

interface DocumentationLayoutProps {
  children: React.ReactNode;
}

export default function DocumentationLayout({ children }: DocumentationLayoutProps) {
  return (
    <div className="documentation-layout">
      <Header />
      <div className="documentation-container">
        <aside className="documentation-sidebar">
          <DocumentationNav />
        </aside>
        <main className="documentation-content">
          {children}
        </main>
      </div>
    </div>
  );
}