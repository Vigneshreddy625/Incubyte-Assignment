import React from 'react';
import ImageCarousel from './ImageCarousel';

function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen lg:p-4 bg-gradient-to-r from-amber-50 to-gray-100">
      <ImageCarousel />
      <div className="flex w-full lg:w-1/2 items-center justify-center p-2 md:p-8">
        <div className="w-full p-2 sm:p-0 rounded-lg max-w-md border border-gray-300 sm:border-none">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;