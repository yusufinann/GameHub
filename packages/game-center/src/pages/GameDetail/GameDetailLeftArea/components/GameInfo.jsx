import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Avatar,
  styled,
  useTheme,
} from '@mui/material';
import {
  ExpandMore,
  SportsEsports,
  Help,
  Star,
} from '@mui/icons-material';

// Styled component for animasyonlu avatarlar
const StyledAvatar = styled(Avatar)(({ theme, gradient }) => ({
  width: 48,
  height: 48,
  fontSize: '1.1rem',
  background: gradient,
  border: '2px solid white',
  transition: 'transform 0.2s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.15)',
  },
}));

// Custom Avatar Group: 7'den fazla üye olduğunda avatarları overlap edip sonrasında +N gösterir.
function CustomAvatarGroup({ members, gradient, max = 7, getInitials }) {
  const displayedMembers = members.slice(0, max);
  const extraCount = members.length - max;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {displayedMembers.map((member, index) => (
        <StyledAvatar
          key={index}
          gradient={gradient}
          sx={{
            ml: index === 0 ? 0 : '-16px', // Avatarların üst üste gelmesi için negatif margin
            zIndex: members.length - index, // Sonradan gelenlerin altta kalması için z-index
          }}
          title={member.name}
        >
          {getInitials(member.name)}
        </StyledAvatar>
      ))}
      {extraCount > 0 && (
        <StyledAvatar
          gradient={gradient}
          sx={{
            ml: '-16px',
            zIndex: 0,
            backgroundColor: 'grey',
          }}
          title={`+${extraCount} more`}
        >
          +{extraCount}
        </StyledAvatar>
      )}
    </Box>
  );
}

function GameInfo({ colorScheme, game, filteredLobbies }) {
  const theme = useTheme();

  // Tüm lobi üyelerinden benzersiz avatarları al
  const allMemberAvatars = filteredLobbies
    .flatMap(lobby => lobby.members)
    .filter((member, index, self) =>
      self.findIndex(m => m.name === member.name) === index
    );

  // İsimden baş harflerini alma fonksiyonu
  const getInitials = (name) =>
    name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: '0 10px 40px rgba(34,193,195,0.2)',
        overflow: 'hidden',
        background: colorScheme.cardBg,
        mb: 4,
      }}
    >
      {/* Üstte geniş resim ve overlay */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="300"
          image={game.image}
          alt={game.title}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)',
          }}
        />
        <Box sx={{ position: 'absolute', bottom: 16, left: 16 }}>
          <Typography
            variant="h3"
            sx={{
              background: colorScheme.accentGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.6)',
            }}
          >
            {game.title}
          </Typography>
        </Box>
      </Box>
      <CardContent sx={{ pt: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mb: 2,
          }}
        >
          {/* Aktif Oyuncular Bölümü */}
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
              Active Players
            </Typography>
            <CustomAvatarGroup
              members={allMemberAvatars}
              gradient={colorScheme.buttonGradient}
              max={7}
              getInitials={getInitials}
            />
          </Box>

          {/* Tür ve Puan Bölümü */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={<SportsEsports />}
              label={`Type: ${game.genre}`}
              sx={{
                background: colorScheme.buttonGradient,
                color: 'white',
                fontWeight: 'bold',
                '& .MuiSvgIcon-root': { color: 'white' },
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            />
            <Chip
              icon={<Star />}
              label={`${game.rating}/5`}
              sx={{
                background: colorScheme.buttonGradient,
                color: 'white',
                fontWeight: 'bold',
                '& .MuiSvgIcon-root': { color: 'white' },
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            />
          </Box>
        </Box>

        {/* Oyun Açıklaması */}
        <Typography
          variant="body1"
          paragraph
          sx={{ color: theme.palette.text.primary, lineHeight: 1.6 }}
        >
          {game.description}
        </Typography>

        {/* Nasıl Oynanır Bölümü */}
        <Accordion
          sx={{
            mt: 3,
            background: 'transparent',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore sx={{ color: 'white' }} />}
            sx={{
              background: colorScheme.buttonGradient,
              borderRadius: 2,
              color: 'white',
              px: 2,
              py: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Help />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                How to Play?
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ background: colorScheme.cardBg, borderRadius: 2, mt: 1 }}>
            <List>
              {game.howToPlay.map((step, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemText
                    primaryTypographyProps={{ color: theme.palette.text.primary }}
                    primary={`${index + 1}. ${step}`}
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
}

export default GameInfo;
