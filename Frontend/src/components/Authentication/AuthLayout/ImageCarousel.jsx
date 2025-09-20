import React, { useState, useEffect } from 'react';

const images = ["/sweets1.jpg", "/sweets2.avif", "/sweets3.avif"];

function ImageCarousel() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center">
      <img
        src={images[currentImageIndex]}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute top-8 left-8 z-20">
        <h1 className="text-white text-2xl font-bold">Vsweets</h1>
      </div>
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentImageIndex
                ? "bg-white"
                : "bg-white bg-opacity-50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default ImageCarousel;