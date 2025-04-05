import { useState, useCallback, useEffect } from "react";
import { login, validateToken } from "./api"; 
import { useNavigate } from "react-router-dom";
import crypto from 'crypto-js';
import { useAuthContext } from "../../../shared/context/AuthContext";

const useLoginForm = () => {
  const navigate = useNavigate();
  const { login: authLogin, logout } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedUser, setSavedUser] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false); 

  const validateTokenFromAPI = useCallback(async (token) => {
    try {
      const response = await validateToken(token);
      if (response.status === 200) {
        navigate('/');
      }
    } catch (err) {
      localStorage.removeItem("token");
      logout();
    }
  }, [navigate, logout]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      validateTokenFromAPI(token);
    }
    if (!isNavigating) {
      const encryptedUser = localStorage.getItem("savedUser");
      if (encryptedUser) {
        const decryptedBytes = crypto.AES.decrypt(encryptedUser, 'secret_key');
        const userInfo = JSON.parse(decryptedBytes.toString(crypto.enc.Utf8));
        setSavedUser(userInfo);
        setEmail(userInfo.email);
      }
    }
  }, [validateTokenFromAPI, isNavigating]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    try {
      const response = await login({ email, password, rememberMe });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      authLogin({ id: user.id, email: user.email, name: user.name, username: user.username, avatar: user.avatar, token });
      setIsNavigating(true);
      
      if (rememberMe) {
        const userInfo = { email: user.email, id: user.id, name: user.name, avatar: user.avatar };
        const encrypted = crypto.AES.encrypt(
          JSON.stringify(userInfo),
          'secret_key'
        ).toString();
        localStorage.setItem("savedUser", encrypted);
      }

      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
      setIsNavigating(false); // Reset flag if login fails
      setLoading(false);
    }
  };

  const quickLogin = async (event) => {
    if (savedUser) {
      setEmail(savedUser.email);
      if (password) {
        handleSubmit(event);
      }
    }
  };

  const handleUseDifferentAccount = useCallback(() => {
    localStorage.removeItem("savedUser");
    setSavedUser(null);
    setEmail("");
    setPassword("");
    setRememberMe(false);
  }, []);

  return {
    email,
    password,
    showPassword,
    rememberMe,
    loading,
    error,
    savedUser,
    handleEmailChange: useCallback((e) => setEmail(e.target.value), []),
    handlePasswordChange: useCallback((e) => setPassword(e.target.value), []),
    handleRememberMeChange: useCallback((e) => setRememberMe(e.target.checked), []),
    handleClickShowPassword: useCallback(() => setShowPassword(p => !p), []),
    handleSubmit,
    quickLogin,
    handleUseDifferentAccount,
  };
};

export default useLoginForm;