import React from 'react';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="h-screen w-full overflow-hidden bg-slate-50">
      {children}
    </div>
  );
};