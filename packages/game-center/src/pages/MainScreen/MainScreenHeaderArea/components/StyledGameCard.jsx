import React, {useState} from 'react';
import { 
  Box, 
  Typography, 
  Card,
  CardContent,
  Stack,
  alpha,
  useMediaQuery
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
function StyledGameCard({ game, isSelected, onClick ,theme}){
   
    const [isHovered, setIsHovered] = useState(false);
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
    return (
      <Card
        onClick={onClick}
       onMouseEnter={() => setIsHovered(true)}
   onMouseLeave={() => setIsHovered(false)}
        sx={{
          bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          minWidth: 200,
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
          }
        }}
      >
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                position: 'relative',
                width: isMobile ? 56 : 80,
                height: isMobile ? 56 : 80,
                borderRadius: 2,
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              <Box
                component="img"
                src={game.image}
                alt={game.title}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: isHovered ? 'none' : 'block'
                }}
              />
              {isHovered && (
                <Box
                  component="img"
                  src={game.gif}
                  alt={`${game.title} animation`}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              )}
            </Box>
            <Stack spacing={0.5} flex={1} minWidth={120}>
              <Typography variant="h6" color="common.white" noWrap>
                {game.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {game.genre}
              </Typography>
            </Stack>
            <ChevronRightIcon sx={{ color: 'text.secondary', flexShrink: 0 }} />
          </Stack>
        </CardContent>
      </Card>
    );
  };
  export default StyledGameCard;