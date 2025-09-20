import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import FormInput from "./AuthLayout/FormInput";
import AuthLayout from "./AuthLayout/AuthLayout";

function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({});
  const passwordRef = useRef();

  const navigate = useNavigate();
  const {
    signup,
    error: authError,
    isLoading: authLoading,
  } = useAuth();

  useEffect(() => {
    if (authError) {
      setErrorMessage(authError);
      setErrors((prev) => ({ ...prev, general: authError }));
    }
  }, [authError]);

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

    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm password is required";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await signup({
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
      });
      
      if (result.success) {
        navigate("/dashboard");
      }
    } catch (error) {
      setErrorMessage(error.message || "Signup failed");
      setErrors((prev) => ({
        ...prev,
        general: error.message || "Signup failed",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">
          Create your account
        </h1>
        <p className="text-gray-800">
          Already have an account?{" "}
          <Link to="/login" className="text-black underline font-medium">
            Log in
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <FormInput
              label="First Name"
              name="firstName"
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
            />
          </div>
          <div className="flex-1">
            <FormInput
              label="Last Name"
              name="lastName"
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
            />
          </div>
        </div>

        <FormInput
          label="Email"
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <FormInput
          label="Enter your password"
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          inputRef={passwordRef}
          showPasswordToggle
          showPassword={showPassword}
          handlePasswordVisibility={handlePasswordVisibility}
        />

        <FormInput
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          inputRef={passwordRef}
          showPasswordToggle
          showPassword={showPassword}
          handlePasswordVisibility={handlePasswordVisibility}
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
              Creating account...
            </span>
          ) : (
            "Sign up"
          )}
        </button>
      </form>
    </AuthLayout>
  );
}

export default Signup;
