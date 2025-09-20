import React, { useState, useEffect } from "react";

const RestockSweetModal = ({ show, sweet, onClose, onSubmit }) => {
  const [restockQuantity, setRestockQuantity] = useState("");

  useEffect(() => {
    if (!show) {
      setRestockQuantity("");
    }
  }, [show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const quantity = parseInt(restockQuantity);
    onSubmit(quantity);
  };

  if (!show || !sweet) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-md mx-4 bg-white rounded-xl shadow-lg p-6 animate-[fadeIn_0.2s_ease-out]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Restock Sweet</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="mb-5 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
          <div>
            <p className="text-base font-semibold text-gray-800">
              {sweet.name}{" "}
              <span className="ml-2 text-sm text-gray-500">
                (Stock: {sweet.quantity})
              </span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity to Add
            </label>
            <input
              type="number"
              value={restockQuantity}
              onChange={(e) => setRestockQuantity(e.target.value)}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter quantity"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm transition"
            >
              Restock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestockSweetModal;
