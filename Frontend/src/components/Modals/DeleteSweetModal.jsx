import React from "react";

const DeleteSweetModal = ({ show, sweet, onClose, onDelete }) => {
  if (!show || !sweet) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-md mx-4 bg-white rounded-xl shadow-xl p-6 animate-[fadeIn_0.2s_ease-out]">
        <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-4">
          <svg
            className="h-7 w-7 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M5.062 20h13.876c1.54 0 2.502-1.667 
          1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 
          0L3.732 17.5C2.962 18.333 3.524 20 5.062 20z"
            />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
          Delete Sweet
        </h3>

        <p className="text-sm text-gray-600 text-center mb-6">
          Are you sure you want to delete{" "}
          <span className="font-medium text-gray-900">{sweet.name}</span>?{" "}
          <br />
          <span className="text-red-600 font-medium">
            This action cannot be undone.
          </span>
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSweetModal;