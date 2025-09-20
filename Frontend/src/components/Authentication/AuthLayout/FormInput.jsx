import React from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const inputStyle = (extra = "") =>
  `w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${extra}`;

function FormInput({
  label,
  type,
  name,
  value,
  onChange,
  error,
  placeholder,
  showPasswordToggle,
  showPassword,
  handlePasswordVisibility,
  inputRef 
}) {
  return (
    <div className="relative">
      {label && <label htmlFor={name} className="sr-only">{label}</label>}
      <input
        type={showPasswordToggle && showPassword ? "text" : type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        ref={inputRef}
        className={inputStyle(showPasswordToggle ? "pr-12" : "pr-2")}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={handlePasswordVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <FaEye className="h-5 w-5" />
          ) : (
            <FaEyeSlash className="h-5 w-5" />
          )}
        </button>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default FormInput;