export const mainScreenStyles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      width: '60%',
      height: '60vh',
      borderRadius: '20px',
      boxShadow: '0px 10px 30px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      position: 'relative',
      transition: 'transform 0.3s ease-in-out',
      padding: { xs: '15px', sm: '20px' },
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: -1,
    },
    bottomBar: {
      position: 'absolute',
      bottom: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      height: '5px',
      backgroundColor: '#fff',
      borderRadius: '10px',
    },
  };
  
  export const sliderStyles = {
    imageContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    navigation: {
      display: 'flex',
      alignItems: 'center',
      gap: 2,
    },
    navigationButton: {
      color: 'white',
    },
    dots: {
      display: 'flex',
      gap: 1,
    },
    dot: {
      width: 12,
      height: 12,
      borderRadius: '50%',
      bgcolor: 'rgba(255,255,255,0.5)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:hover': {
        bgcolor: 'rgba(255,255,255,0.7)',
      },
    },
    activeDot: {
      bgcolor: 'white',
      '&:hover': {
        bgcolor: 'white',
      },
    },
  };
  
  export const heroStyles = {
    titleContainer: {
      textAlign: 'center',
    },
    mainTitle: {
      color: 'white',
      fontWeight: 100,
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
      mb: 7,
    },
    subTitle: {
      color: 'rgba(255, 255, 255, 0.50)',
      fontWeight: 50,
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
      mb: 5,
    },
    description: {
      color: "rgba(255, 255, 255, 0.5)",
      fontWeight: 50,
      textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
    },
    exploreButton: {
      bgcolor: 'rgba(255, 255, 255, 0.5)',
      color: 'black',
      fontWeight: 'bold',
      px: 4,
      '&:hover': {
        bgcolor: 'rgba(214, 207, 207, 0.49)',
      },
    },
    lobbyButton: {
      color: 'white',
      borderColor: 'white',
      fontWeight: 'bold',
      px: 4,
      '&:hover': {
        borderColor: 'rgba(255,255,255,0.9)',
        bgcolor: 'rgba(255,255,255,0.1)',
      },
    },
  };