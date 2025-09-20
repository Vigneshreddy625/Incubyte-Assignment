import React, { useState, useEffect } from "react";
import { ArrowRight, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const {user} = useAuth();

  const slides = [
    "/sweets1.jpg",
    "/sweets2.avif",
    "/sweets3.avif",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-2000 ease-in-out ${
              index === currentSlide
                ? "opacity-100 scale-100"
                : "opacity-0 scale-110"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/80"></div>
            <img
              src={slide}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto mt-6 sm:mt-0">
          <div className="space-y-4 md:space-y-8">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight">
              <span className="block text-white mb-2">Delight</span>
              <span className="block bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                Your Taste Buds
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed font-light">
              Indulge in the finest sweets and treats, crafted with love and
              the freshest ingredients. Discover our
              <span className="text-yellow-400 font-semibold"> gourmet chocolates</span>,
              <span className="text-orange-400 font-semibold"> traditional mithai</span>, and
              <span className="text-pink-400 font-semibold"> delightful pastries</span> today.
            </p>

            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 pt-6 sm:pt-8">
              <button
                className="group relative px-5 py-3 sm:px-10 sm:py-5 text-sm sm:text-base bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-yellow-500/25 hover:shadow-yellow-500/50"
                onClick={() => navigate("/shop")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <span className="relative flex items-center justify-center space-x-2 sm:space-x-3">
                  <span>Shop Sweets</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 sm:group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </button>

              {user.role === "admin" && (
              <button
                className="group px-5 py-3 sm:px-10 sm:py-5 text-sm sm:text-base bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                onClick={() => navigate("/admin")}
              >
                <span className="flex items-center justify-center space-x-2 sm:space-x-3">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Admin</span>
                </span>
              </button>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`relative w-12 h-1 rounded-full transition-all duration-500 ${
                index === currentSlide
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                  : "bg-white/30 hover:bg-white/50"
              }`}
            >
              {index === currentSlide && (
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
