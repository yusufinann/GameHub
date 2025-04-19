import { useState, useEffect } from 'react';
import apiClient from './api'; 

export const useProfile = (userId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userData = await apiClient.user.getUserProfile(userId);
        
        if (isMounted) {
          setUser({
            ...userData,
            achievements: userData.achievements || [],
            recentGames: userData.recentGames || []
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Profil yüklenirken hata oluştu');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (userId) {
      fetchUserProfile();
    } else {
      setLoading(false);
      setError('Geçersiz kullanıcı ID');
    }

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return { user, loading, error };
};