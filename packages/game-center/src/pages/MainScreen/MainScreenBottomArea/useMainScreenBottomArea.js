import { useState, useEffect } from 'react';

function useMainScreenBottomArea(fetchGiveaways) {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const loadGames = async () => {
        setLoading(true);
        setError(null);
        try {
          const { data } = await fetchGiveaways(); // Destructure the response
          setGames(data); // Assuming data is directly an array of games
        } catch (error) {
          setError(error.message || 'Failed to load games. Please try again later.');
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
  
      loadGames();
    }, [fetchGiveaways]);
  
    return { games, loading, error };
  }
  
  export default useMainScreenBottomArea;