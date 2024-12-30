export const handleShare = (platform, lobbyCode, lobbyLink) => {
    const shareText = `Lobime katıl! Kod: ${lobbyCode}`;
    const shareUrl = lobbyLink;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    };
  
    window.open(shareUrls[platform], '_blank');
  };
  
  export const handleCopy = (value, setSnackbar) => {
    navigator.clipboard.writeText(value)
      .then(() => setSnackbar({ open: true, severity: 'success', message: 'Copied to clipboard!' }))
      .catch(() => setSnackbar({ open: true, severity: 'error', message: 'Failed to copy!' }));
  };
  