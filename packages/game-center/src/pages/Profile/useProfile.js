import { useState, useEffect } from 'react';
import { userApi } from './api';

export const useProfile = (userId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userData = await userApi.getUserProfile(userId);
        setUser(userData);

        // Küçük gecikme ile progress animasyonu
        const timer = setTimeout(() => {
          setProgress((1 / 5) * 100);
        }, 200);
        return () => clearTimeout(timer);
      } catch (err) {
        setError(err);
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  return { user, loading, error, progress, successMessage };
};