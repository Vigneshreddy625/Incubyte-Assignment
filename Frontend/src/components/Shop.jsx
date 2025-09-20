import React, { useState, useEffect, useRef } from "react";
import { Search, Filter, X, ShoppingCart } from "lucide-react";
import { useSweet } from "../contexts/SweetContext";
import { useCart } from "../contexts/CartContext";
import Notification from "./Notification";
import ShoppingCartComponent from "./ShoppingCart";

const SweetsShowcase = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef(null);

  const { sweets, isLoading, error, getAllSweets } = useSweet();
  const { addToCart, totalItems } = useCart();
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterRef]);

  useEffect(() => {
    getAllSweets(1, 50); 
  }, [getAllSweets]);

  const categories = [
    "All",
    ...new Set(sweets.map((sweet) => sweet.category).filter(Boolean)),
  ];

  const filteredSweets = sweets.filter((sweet) => {
    const categoryMatch =
      selectedCategory === "All" || sweet.category === selectedCategory;

    const searchMatch =
      !searchTerm ||
      sweet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sweet.category.toLowerCase().includes(searchTerm.toLowerCase());

    const price = parseFloat(sweet.price);
    const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
    const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
    const priceMatch = price >= minPrice && price <= maxPrice;

    return categoryMatch && searchMatch && priceMatch;
  });

  const getStockStatus = (quantity) => {
    if (quantity === 0)
      return { text: "Out of Stock", color: "text-red-600 bg-red-100" };
    if (quantity <= 10)
      return { text: "Low Stock", color: "text-orange-600 bg-orange-100" };
    return { text: "In Stock", color: "text-green-600 bg-green-100" };
  };

  const handleAddToCart = (sweet) => {
    addToCart(sweet, 1);
    setNotification({
      show: true,
      message: `${sweet.name} added to cart`,
      type: "success",
    });
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange({ min: "", max: "" });
    setSelectedCategory("All");
  };

  const handlePriceRangeChange = (field, value) => {
    setPriceRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const hasActiveFilters =
    searchTerm ||
    priceRange.min ||
    priceRange.max ||
    selectedCategory !== "All";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading sweet delights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => getAllSweets(1, 50)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="py-4 sm:py-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
            Sweet Delights
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our premium collection of handcrafted sweets.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-semibold">Categories: </h1>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => setShowCart(true)}
              className="relative flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-all duration-300 shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              Cart
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                  {totalItems}
                </span>
              )}
            </button>
            
            <div className="flex-grow relative min-w-[100px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search sweets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm text-gray-900 placeholder-gray-500 transition-all"
              />
            </div>
            <div ref={filterRef} className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-shrink-0 flex items-center gap-2 px-2 sm:px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-sm ${
                  showFilters
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                    {
                      [
                        searchTerm,
                        priceRange.min,
                        priceRange.max,
                        selectedCategory !== "All" ? 1 : 0,
                      ].filter(Boolean).length
                    }
                  </span>
                )}
              </button>
              {showFilters && (
                <div className="absolute right-0 mt-2 p-6 bg-white border border-gray-200 rounded-xl shadow-lg z-10 before:content-[''] before:absolute before:-top-2 before:right-6 before:w-4 before:h-4 before:bg-white before:border-t before:border-l before:border-gray-200 before:rotate-45 min-w-[400px]">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Advanced Filters
                  </h3>
                  <div className="flex flex-col space-y-2">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Price Range (₹)
                      </label>
                      <div className="flex gap-4 items-center">
                        <input
                          type="number"
                          placeholder="Min Price"
                          value={priceRange.min}
                          onChange={(e) =>
                            handlePriceRangeChange("min", e.target.value)
                          }
                          className="max-w-1/2 flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm transition-all"
                          min="0"
                          step="0.01"
                        />
                        <span className="text-gray-500 font-medium text-sm">
                          to
                        </span>
                        <input
                          type="number"
                          placeholder="Max Price"
                          value={priceRange.max}
                          onChange={(e) =>
                            handlePriceRangeChange("max", e.target.value)
                          }
                          className="max-w-1/2 flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm transition-all"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    {/* <div className="flex items-end">
                      <div className="bg-gray-100 rounded-lg p-4 w-full max-w-[200px]">
                        <div className="text-sm font-semibold text-gray-800">
                          Showing Results
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {filteredSweets.length}
                        </div>
                        <div className="text-xs text-gray-600">
                          of {sweets.length} total sweets
                        </div>
                      </div>
                    </div> */}
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium border border-gray-300 hover:bg-gray-100 transition-all duration-300 shadow-sm"
                      >
                        <X className="w-4 h-4" />
                        Clear
                      </button>
                    )}
                    <button
                      onClick={() => setShowFilters(false)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-all duration-300"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium border border-gray-300 hover:bg-gray-100 transition-all duration-300 shadow-sm md:hidden"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
          {filteredSweets.map((sweet) => {
            const stockStatus = getStockStatus(sweet.quantity);
            return (
              <div
                key={sweet._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group border border-gray-200"
              >
                <div className="relative ">
                  <img
                    src="/photo.avif"
                    alt={sweet.name}
                    className="w-full h-full"
                  />
                  <div
                    className={`absolute top-2 right-2 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${stockStatus.color}`}
                  >
                    {stockStatus.text}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {sweet.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{sweet.category}</p>
                  <div className="flex items-center justify-between mb-4 text-sm font-medium">
                    <div className="text-gray-600">Stock:</div>
                    <div className="text-gray-900">{sweet.quantity} units</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{sweet.price}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(sweet)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={sweet.quantity === 0}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {sweet.quantity === 0 ? "Sold Out" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredSweets.length === 0 && (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🍭</div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              No sweets found
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              {hasActiveFilters
                ? "Try adjusting your filters to find more delicious treats"
                : "No sweets available in this category"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all duration-300 shadow-md"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={closeNotification}
        duration={4000}
      />

      <ShoppingCartComponent
        isOpen={showCart}
        onClose={() => setShowCart(false)}
      />
    </div>
  );
};

export default SweetsShowcase;
