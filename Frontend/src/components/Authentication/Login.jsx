import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { KeyRound, LogIn, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import AuthLayout from "./AuthLayout/AuthLayout"; 
import FormInput from "./AuthLayout/FormInput"; 

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [showAdminPopup, setShowAdminPopup] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [adminError, setAdminError] = useState("");

  const passwordRef = useRef(null);
  const adminInputRef = useRef(null);
  const navigate = useNavigate();
  const { login, error: authError, isLoading: authLoading } = useAuth();
  const ADMIN_CODE = "pramod";

  useEffect(() => {
    if (authError) {
      setErrorMessage(authError);
      setErrors((prev) => ({ ...prev, general: authError }));
    }
  }, [authError]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault();
        setShowAdminPopup(true);
        setAdminCode("");
        setAdminError("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (showAdminPopup && adminInputRef.current) {
      adminInputRef.current.focus();
    }
  }, [showAdminPopup]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errorMessage) {
      setErrorMessage("");
    }
    setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
  };

  const handlePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      });
      
      if (result.success) {
        navigate("/dashboard");
      }
    } catch (error) {
      setErrorMessage(error.message || "An error occurred during login");
      setErrors((prev) => ({
        ...prev,
        general: error.message || "An error occurred during login",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    if (adminCode === ADMIN_CODE) {
      setShowAdminPopup(false);
      navigate("/adminlogin123");
    } else {
      setAdminError("Invalid admin code");
      setAdminCode("");
    }
  };

  const handleAdminPopupClose = () => {
    setShowAdminPopup(false);
    setAdminCode("");
    setAdminError("");
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">
          Log in to your account
        </h1>
        <p className="text-gray-800">
          Don't have an account?{" "}
          <Link to="/signup" className="text-black underline font-medium">
            Sign up
          </Link>
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <FormInput
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          error={errors.email}
        />
        <FormInput
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          error={errors.password}
          showPasswordToggle
          showPassword={showPassword}
          handlePasswordVisibility={handlePasswordVisibility}
          inputRef={passwordRef}
        />

        {errors.general && (
          <div className="p-3 text-sm text-red-500 bg-red-900 bg-opacity-50 rounded-lg border border-red-500">
            {errors.general}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || authLoading}
          className="cursor-pointer w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50"
        >
          {isLoading || authLoading ? (
            <span className="flex items-center justify-center">
              <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Logging in...
            </span>
          ) : (
            "Log in"
          )}
        </button>

        {/* <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-900">
              Or log in with
            </span>
          </div>
        </div>

        <button
          type="button"
          className="cursor-pointer w-full flex items-center justify-center px-4 py-3 bg-white border border-gray-200 rounded-lg text-black hover:bg-gray-100 transition duration-200"
        >
          <img
            className="mr-4 h-5"
            src="https://static.cdnlogo.com/logos/g/35/google-icon.svg"
            alt=""
          />{" "}
          Google
        </button> */}
      </form>

      {showAdminPopup && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 sm:px-0">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in border border-gray-200">
            <div className="flex justify-between items-center p-5 bg-blue-50 border-b border-blue-100">
              <h2 className="text-lg font-semibold text-gray-800">
                Admin Access
              </h2>
              <button
                onClick={handleAdminPopupClose}
                className="text-gray-500 hover:text-gray-700 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdminSubmit} className="p-6 space-y-5">
              <div>
                <label
                  htmlFor="adminCode"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Enter Admin Code
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    type="password"
                    id="adminCode"
                    ref={adminInputRef}
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 shadow-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
                {adminError && (
                  <p className="text-red-500 text-sm mt-2">{adminError}</p>
                )}
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-md transform hover:scale-105"
                >
                  <LogIn className="h-5 w-5 mr-2" /> Access Admin
                </button>
                <button
                  type="button"
                  onClick={handleAdminPopupClose}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-md transform hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

export default Login;