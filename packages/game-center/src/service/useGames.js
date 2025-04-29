import { useState, useEffect } from 'react';
import { fetchGames } from './gameService';

export function useGames({ limit, offset } = {}) {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchGames({ limit, offset })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [limit, offset]);

  return { data, loading, error };
}
