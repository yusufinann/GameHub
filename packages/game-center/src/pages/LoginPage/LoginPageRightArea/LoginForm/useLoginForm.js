import { useState, useCallback, useEffect } from "react";
import { login, validateToken } from "./api"; 
import { useNavigate } from "react-router-dom";
import crypto from 'crypto-js';
import { useAuthContext } from "../../../../shared/context/AuthContext"; 
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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

  const clearSavedUser = useCallback(() => {
    localStorage.removeItem("savedUser");
    setSavedUser(null);
    setEmail("");
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      validateTokenFromAPI(token);
    }
    if (!isNavigating) {
      const encryptedUser = localStorage.getItem("savedUser");
      if (encryptedUser) {
        try {
          const decryptedBytes = crypto.AES.decrypt(encryptedUser, 'secret_key'); // Güvenlik için 'secret_key'i daha güvenli bir yerden alın
          const decryptedString = decryptedBytes.toString(crypto.enc.Utf8);

          if (decryptedString) {
            const userInfo = JSON.parse(decryptedString);
            if (userInfo && userInfo.email) {
              if (!userInfo.avatar && (!userInfo.name || userInfo.name.trim() === "")) {
                console.warn("Saved user data is incomplete (missing avatar and valid name). Clearing for standard login.");
                clearSavedUser();
              } else {
                setSavedUser(userInfo);
                setEmail(userInfo.email);
              }
            } else {
              console.warn("Decrypted savedUser data is missing essential fields (e.g., email). Clearing.");
              clearSavedUser();
            }
          } else {
            console.warn("Decrypted savedUser data is empty. Clearing.");
            clearSavedUser();
          }
        } catch (error) {
          console.error("Failed to decrypt or parse savedUser from localStorage:", error);
          clearSavedUser();
        }
      }
    }
  }, [validateTokenFromAPI, isNavigating, clearSavedUser]);

  const handleSubmit = async (event) => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError(t("login.EMAIL_PASSWORD_REQUIRED"));
      setLoading(false);
      return;
    }

    try {
      const response = await login({ email, password, rememberMe });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      authLogin({ id: user.id, email: user.email, name: user.name, username: user.username, avatar: user.avatar, token });
      setIsNavigating(true);

      if (rememberMe || savedUser) {
        const userInfoToSave = {
          email: user.email,
          id: user.id,
          name: user.name || '',
          avatar: user.avatar || null
        };
        const encrypted = crypto.AES.encrypt(
          JSON.stringify(userInfoToSave),
          'secret_key' 
        ).toString();
        localStorage.setItem("savedUser", encrypted);
      } else {
        localStorage.removeItem("savedUser");
      }

      navigate("/");
    } catch (err) {
      const errorCode = err?.response?.data?.code;
      let displayError;
      
      if (errorCode) {
        displayError = t(`login.${errorCode}`, { defaultValue: t("login.error.generic") });
      } else {
        displayError = t("login.error.generic");
      }

      setError(displayError);
      setIsNavigating(false);
      setLoading(false);
    }
  };

  const quickLogin = async (event) => {
    if (savedUser && savedUser.email) {
      if (password) {
        handleSubmit(event);
      } else {
        setError(t("login.PASSWORD_REQUIRED"));
      }
    } else {
        console.warn("Quick login attempted with invalid savedUser. Clearing.")
        clearSavedUser();
    }
  };

  const handleUseDifferentAccount = useCallback(() => {
    localStorage.removeItem("savedUser");
    setSavedUser(null);
    setEmail("");
    setPassword("");
    setRememberMe(false);
    setError(null);
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
    handlePasswordChange: useCallback((e) => {
        setPassword(e.target.value);
        if(error) setError(null);
    }, [error]),
    handleRememberMeChange: useCallback((e) => setRememberMe(e.target.checked), []),
    handleClickShowPassword: useCallback(() => setShowPassword(p => !p), []),
    handleSubmit,
    quickLogin,
    handleUseDifferentAccount,
  };
};

export default useLoginForm;