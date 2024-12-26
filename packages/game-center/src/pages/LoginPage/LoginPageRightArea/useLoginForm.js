import { useState, useCallback } from "react";
import { login } from "./api"; // Assuming the login function is from api.js
import { useNavigate } from "react-router-dom"; // Import useNavigate

const useLoginForm = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle form field changes
  const handleEmailChange = useCallback((event) => setEmail(event.target.value), []);
  const handlePasswordChange = useCallback((event) => setPassword(event.target.value), []);
  const handleRememberMeChange = useCallback((event) => setRememberMe(event.target.checked), []);

  // Toggle password visibility
  const handleClickShowPassword = useCallback(() => setShowPassword((prev) => !prev), []);

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const response = await login({ email, password, rememberMe });
      const token = response.data.token;
      localStorage.setItem("token", token);
      navigate("/"); 
    } catch (err) {
      console.error("Login error:", err);
      setError(err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return {
    email,
    password,
    showPassword,
    rememberMe,
    loading,
    error,
    handleEmailChange,
    handlePasswordChange,
    handleRememberMeChange,
    handleClickShowPassword,
    handleSubmit,
  };
};

export default useLoginForm;
