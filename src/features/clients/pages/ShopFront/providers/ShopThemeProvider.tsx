import React from 'react';

interface ShopThemeProviderProps {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  children: React.ReactNode;
}

const ShopThemeProvider: React.FC<ShopThemeProviderProps> = ({
  primaryColor,
  secondaryColor,
  fontFamily,
  children,
}) => {
  return (
    <div
      style={
        {
          '--shop-primary': primaryColor,
          '--shop-secondary': secondaryColor,
          '--shop-font': fontFamily,
        } as React.CSSProperties
      }
      className="min-h-screen"
    >
      {children}
    </div>
  );
};

export default ShopThemeProvider;
