import React from 'react';
import Header from '@/components/layout/header/Header';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Header />
      <main className="flex-1 p-4 overflow-y-auto overflow-x-hidden pt-16">
        {children}
      </main>
    </div>
  );
};
