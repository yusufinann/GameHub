import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  useTheme,
} from '@mui/material';
import {
  ExpandMore,
  SportsEsports,
  Help,
  Star,
  EmojiEvents,
} from '@mui/icons-material';
import CustomAvatarGroup from './CustomAvatarGroup';

function GameInfoDetails({game, filteredLobbies }) {
  const theme = useTheme();

  const allMemberAvatars = filteredLobbies
    .flatMap(lobby => lobby.members)
    .filter((member, index, self) =>
      self.findIndex(m => m.name === member.name) === index
    );

  const getInitials = (name) =>
    name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();

  // Oyun modları verisi
  const gameModes = {
    bingo: [
      {
        mode: "classic",
        title: "Classic Bingo",
        icon: "🔹",
        speed: "5s/number",
        features: ["Standard rules", "Live marking only", "No history"],
        color: "#4A90E2"
      },
      {
        mode: "extended",
        title: "Extended Time",
        icon: "🕒",
        speed: "5s/number",
        features: ["10s visibility", "2 numbers visible", "Mark history"],
        color: "#50E3C2"
      },
      {
        mode: "superfast",
        title: "Super Fast",
        icon: "⚡",
        speed: "3s/number",
        features: ["Quick decisions", "3s visibility", "Penalty system"],
        color: "#FF6B6B"
      }
    ],
    competition: [
      {
        mode: "competitive",
        title: "Competitive Mode",
        icon: "🏆",
        features: ["Ranked play", "Full game duration", "Score tracking"],
        color: "#FFD700"
      },
      {
        mode: "non-competitive",
        title: "Casual Mode",
        icon: "🎉",
        features: ["First win ends game", "Friendly play", "Quick matches"],
        color: "#7ED321"
      }
    ]
  };

  return (
    <Box sx={{ pt: 3 }}>
      {/* Aktif Oyuncular ve Bilgiler */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        mb: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{
            fontWeight: 'bold',
            color: theme.palette.text.primary,
            fontFamily: '"Bangers", cursive',
            letterSpacing: '1.5px'
          }}>
            Active Players
          </Typography>
          <CustomAvatarGroup
            members={allMemberAvatars}
            max={7}
            getInitials={getInitials}
          />
        </Box>

        {/* Oyun Bilgi Chipleri */}
        <Box sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          '& .MuiChip-root': {
            borderRadius: '8px',
            fontSize: '0.9rem',
            padding: '0 10px'
          }
        }}>
          <Chip
            icon={<SportsEsports sx={{ color: 'white !important' }} />}
            label={`Type: ${game.genre}`}
            sx={{
              background: theme.palette.secondary.main,
              color: 'white',
              fontWeight: 'bold',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}
          />
          <Chip
            icon={<Star sx={{ color: 'white !important' }} />}
            label={`${game.rating}/5`}
            sx={{
              background: theme.palette.secondary.main,
              color: 'white',
              fontWeight: 'bold',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}
          />
          <Chip
            icon={<EmojiEvents sx={{ color: 'white !important' }} />}
            label="Competitive"
            sx={{
              background: theme.palette.secondary.main,
              color: 'white',
              fontWeight: 'bold',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}
          />
        </Box>
      </Box>

      {/* Oyun Açıklaması */}
      <Typography
        variant="body1"
        paragraph
        sx={{
          color: theme.palette.text.primary,
          lineHeight: 1.6,
          fontFamily: '"Nunito", sans-serif',
          backgroundColor: 'rgba(0,0,0,0.05)',
          padding: 3,
          borderRadius: '16px',
          borderLeft: `4px solid ${theme.palette.secondary.main}`
        }}
      >
        {game.description}
      </Typography>

      {/* Oyun Modları Bölümü */}
      <Accordion
        defaultExpanded // Accordion initially expanded
        sx={{
          mt: 3,
          background: 'transparent',
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore sx={{ color: 'white' }} />}
          sx={{
            background: theme.palette.secondary.main,
            borderRadius: '12px',
            color: 'white',
            px: 2,
            py: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <EmojiEvents sx={{ fontSize: '28px' }} />
            <Typography variant="subtitle1" sx={{
              fontWeight: 'bold',
              fontFamily: '"Bubblegum Sans", cursive',
              fontSize: '1.4rem'
            }}>
              Game Modes & Rules
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{
          background: theme.palette.secondary.paper,
          borderRadius: '16px',
          mt: 1,
          padding: 3
        }}>
          {/* Bingo Modları */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{
              color: '#FFE14C',
              fontFamily: '"Bangers", cursive',
              fontSize: '1.8rem',
              letterSpacing: '1px',
              mb: 3,
              textShadow: '2px 2px 0 #000',
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: '-8px',
                left: 0,
                width: '60px',
                height: '4px',
                borderRadius: '2px'
              }
            }}>
              Bingo Modes
            </Typography>

            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 3,
            }}>
              {gameModes.bingo.map((mode) => (
                <Box key={mode.mode} sx={{
                  background: `linear-gradient(145deg, ${mode.color})`,
                  borderRadius: '16px',
                  p: 2,
                  boxShadow: 3,
                  border: '2px solid rgba(255,255,255,0.2)',
                  transform: 'translateY(0)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1
                  }}>
                    <Typography variant="h5" sx={{
                      fontSize: '2rem',
                      filter: 'drop-shadow(2px 2px 1px rgba(0,0,0,0.3))'
                    }}>
                      {mode.icon}
                    </Typography>
                    <Typography variant="h6" sx={{
                      color: 'white',
                      fontFamily: '"Bubblegum Sans", cursive',
                      fontWeight: 'bold',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                    }}>
                      {mode.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{
                    color: 'rgba(255,255,255,0.9)',
                    fontFamily: '"Nunito", sans-serif',
                    mb: 1,
                    fontWeight: 600
                  }}>
                    ⏱️ {mode.speed}
                  </Typography>
                  <Box component="ul" sx={{
                    pl: 2,
                    '& li': {
                      color: 'rgba(255,255,255,0.9)',
                      fontFamily: '"Nunito", sans-serif',
                      fontSize: '0.9rem',
                      mb: 0.5,
                      position: 'relative',
                      '&:before': {
                        content: '"•"',
                        color: mode.color,
                        marginRight: '8px',
                        fontSize: '1.2rem'
                      }
                    }
                  }}>
                    {mode.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Rekabet Modları */}
          <Box>
            <Typography variant="h5" sx={{
              color: '#FFE14C',
              fontFamily: '"Bangers", cursive',
              fontSize: '1.8rem',
              letterSpacing: '1px',
              mb: 3,
              textShadow: '2px 2px 0 #000',
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: '-8px',
                left: 0,
                width: '60px',
                height: '4px',
                borderRadius: '2px'
              }
            }}>
              Competition Styles
            </Typography>

            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 3,
            }}>
              {gameModes.competition.map((mode) => (
                <Box key={mode.mode} sx={{
                  background: `linear-gradient(145deg, ${mode.color} 30%, ${theme.palette.background.paper} 100%)`,
                  borderRadius: '16px',
                  p: 2,
                  boxShadow: 3,
                  border: '2px solid rgba(255,255,255,0.2)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: '-50%',
                    right: '-50%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1))',
                    transform: 'rotate(30deg)'
                  }
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Typography variant="h5" sx={{
                      fontSize: '2rem',
                      filter: 'drop-shadow(2px 2px 1px rgba(0,0,0,0.3))'
                    }}>
                      {mode.icon}
                    </Typography>
                    <Typography variant="h6" sx={{
                      color: 'white',
                      fontFamily: '"Bubblegum Sans", cursive',
                      fontWeight: 'bold',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                    }}>
                      {mode.title}
                    </Typography>
                  </Box>
                  <Box component="ul" sx={{
                    pl: 2,
                    mt: 1,
                    '& li': {
                      color: 'rgba(255,255,255,0.9)',
                      fontFamily: '"Nunito", sans-serif',
                      fontSize: '0.9rem',
                      position: 'relative',
                      '&:before': {
                        content: '"▹"',
                        color: mode.color,
                        marginRight: '8px',
                        position: 'absolute',
                        left: '-15px'
                      }
                    }
                  }}>
                    {mode.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Nasıl Oynanır Bölümü */}
      <Accordion
        defaultExpanded // Accordion initially expanded
        sx={{
          mt: 3,
          background: 'transparent',
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore sx={{ color: 'white' }} />}
          sx={{
            background:theme.palette.secondary.main,
            borderRadius: '12px',
            color: 'white',
            px: 2,
            py: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Help sx={{ fontSize: '28px' }} />
            <Typography variant="subtitle1" sx={{
              fontWeight: 'bold',
              fontFamily: '"Bubblegum Sans", cursive',
              fontSize: '1.4rem'
            }}>
              How to Play?
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{
          background:  theme.palette.secondary.paper,
          borderRadius: '16px',
          mt: 1,
          padding: 3
        }}>
          <List>
            {game.howToPlay.map((step, index) => (
              <ListItem key={index} sx={{
                py: 0.5,
                '&:before': {
                  content: '""',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  mr: 2
                }
              }}>
                <ListItemText
                  primaryTypographyProps={{
                    color: theme.palette.text.primary,
                    fontFamily: '"Nunito", sans-serif',
                    fontSize: '1.1rem'
                  }}
                  primary={`${index + 1}. ${step}`}
                />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

export default GameInfoDetails;