import React, { useState, useEffect } from 'react';
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
  Avatar,
  AvatarGroup,
  Paper,
  Button,
  Tooltip,
  Fade,
  Zoom
} from '@mui/material';
import {
  ExpandMore,
  SportsEsports,
  Help,
  EmojiEvents,
  People,
  Info,
  AccessTime,
  Favorite
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useParams } from "react-router-dom";

function CustomAvatarGroup({ members, max, getInitials }) {
  const theme = useTheme();
  return (
    <AvatarGroup max={max} sx={{
      '& .MuiAvatar-root': {
        width: 38,
        height: 38,
        fontSize: '0.9rem',
        border: `2px solid ${theme.palette.background.paper}`,
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.secondary.contrastText,
        fontWeight: 'bold',
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: 'scale(1.15)',
          zIndex: 10,
          boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
        }
      }
    }}>
      {members.map((member, index) => (
        <Tooltip
          key={index}
          title={member.name}
          arrow
          placement="top"
          TransitionComponent={Zoom}
          TransitionProps={{ timeout: 600 }}
        >
          <Avatar
            alt={member.name}
            src={member.avatar}
            sx={{
              background: !member.avatar ? `${theme.palette.secondary.main}` : undefined,
            }}
          >
            {!member.avatar && getInitials(member.name)}
          </Avatar>
        </Tooltip>
      ))}
    </AvatarGroup>
  );
}

function InfoChip({ icon, label, tooltipText, theme }) {
  return (
    <Tooltip title={tooltipText || label} arrow placement="top">
      <Chip
        icon={icon}
        label={label}
        sx={{
          background: theme.palette.background.gradientFadeBg,
          color: theme.palette.secondary.contrastText,
          fontWeight: 'bold',
          boxShadow: `0 2px 10px ${theme.palette.background.elevation[1]}`,
          borderRadius: '8px',
          fontSize: '0.9rem',
          padding: '0 10px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: `0 4px 12px ${theme.palette.background.elevation[2]}`,
          }
        }}
      />
    </Tooltip>
  );
}

function GameModeCard({ mode, theme, isCompetition = false }) {
  return (
    <Paper elevation={3} sx={{
      background: isCompetition
        ? theme.palette.background.gradient
        : theme.palette.background.gradientB,
      borderRadius: '16px',
      p: 2,
      border: `2px solid ${theme.palette.background.offwhite}`,
      transform: 'translateY(0)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: `0 12px 20px ${theme.palette.background.elevation[2]}`,
        '& .mode-highlight': {
          width: '100%',
          opacity: 1
        }
      },
      '&:before': isCompetition ? {
        content: '""',
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '100%',
        height: '100%',
        background: `linear-gradient(45deg, transparent, ${theme.palette.background.offwhite})`,
        transform: 'rotate(30deg)',
        opacity: 0.4
      } : {}
    }}>
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '4px',
        width: '30%',
        background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
        transition: 'all 0.5s ease',
        opacity: 0.7,
        className: 'mode-highlight'
      }} />

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
          color: theme.palette.text.primary,
          fontWeight: 'bold',
          textShadow: `1px 1px 1px ${theme.palette.background.elevation[1]}`
        }}>
          {mode.title}
        </Typography>
      </Box>

      {mode.speed && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 1
        }}>
          <AccessTime sx={{
            color: theme.palette.secondary.main,
            fontSize: '1rem'
          }} />
          <Typography variant="body2" sx={{
            color: theme.palette.text.secondary,
            fontWeight: 600
          }}>
            {mode.speed}
          </Typography>
        </Box>
      )}

      <Box component="ul" sx={{
        pl: 2,
        '& li': {
          color: theme.palette.text.primary,
          fontSize: '0.9rem',
          mb: 0.5,
          position: 'relative',
          paddingLeft: isCompetition ? '15px' : '0',
          '&:before': {
            content: isCompetition ? '"▹"' : '"•"',
            color: theme.palette.secondary.main,
            marginRight: '8px',
            fontSize: isCompetition ? '1rem' : '1.2rem',
            position: isCompetition ? 'absolute' : 'static',
            left: isCompetition ? 0 : 'auto'
          }
        }
      }}>
        {mode.features.map((feature, idx) => (
          <li key={idx}>{feature}</li>
        ))}
      </Box>
    </Paper>
  );
}


function GameInfoDetails({ game, filteredLobbies }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { gameId } = useParams(); 

  const BINGO_GAME_ID = '1';
  const HANGMAN_GAME_ID = '2';

  const getInitialActiveTab = () => {
    if (gameId === BINGO_GAME_ID) {
      return 'bingo';
    } else if (gameId === HANGMAN_GAME_ID) {
      return 'hangmanLanguage';
    }
    return; 
  };

  const [activeTab, setActiveTab] = useState(getInitialActiveTab());
  const [expanded1, setExpanded1] = useState(true);
  const [expanded2, setExpanded2] = useState(true);

  useEffect(() => {
    setActiveTab(getInitialActiveTab());
  }, [gameId, t]); 


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

  const getFeaturesArray = (featuresObjOrArray) => {
    if (!featuresObjOrArray) return [];
    return Array.isArray(featuresObjOrArray)
      ? featuresObjOrArray
      : Object.values(featuresObjOrArray);
  };

  const getGameModesData = () => {
    if (gameId === BINGO_GAME_ID) { // Bingo
      return {
        bingo: [
          {
            mode: "classic",
            title: t("gameModes.bingo.classic.title"),
            icon: "🔹",
            speed: t("gameModes.bingo.classic.speed"),
            features: getFeaturesArray(t("gameModes.bingo.classic.features", { returnObjects: true }))
          },
          {
            mode: "extended",
            title: t("gameModes.bingo.extended.title"),
            icon: "🕒",
            speed: t("gameModes.bingo.extended.speed"),
            features: getFeaturesArray(t("gameModes.bingo.extended.features", { returnObjects: true }))
          },
          {
            mode: "superfast",
            title: t("gameModes.bingo.superfast.title"),
            icon: "⚡",
            speed: t("gameModes.bingo.superfast.speed"),
            features: getFeaturesArray(t("gameModes.bingo.superfast.features", { returnObjects: true }))
          }
        ],
        competition: [
          {
            mode: "competitive",
            title: t("gameModes.competition.competitive.title"),
            icon: "🏆",
            features: getFeaturesArray(t("gameModes.competition.competitive.features", { returnObjects: true }))
          },
          {
            mode: "non-competitive",
            title: t("gameModes.competition.non-competitive.title"),
            icon: "🎉",
            features: getFeaturesArray(t("gameModes.competition.non-competitive.features", { returnObjects: true }))
          }
        ]
      };
    } else if (gameId === HANGMAN_GAME_ID) { // Hangman
      const hangmanModesBase = t('gameModes.hangman', { returnObjects: true });
      if (hangmanModesBase && hangmanModesBase.languageSelection && hangmanModesBase.wordSource) {
        return {
          hangmanLanguage: Object.values(hangmanModesBase.languageSelection.modes || {}).map(details => ({
            ...details,
            features: getFeaturesArray(details.features)
          })),
          hangmanWordSource: Object.values(hangmanModesBase.wordSource.modes || {}).map(details => ({
            ...details,
            features: getFeaturesArray(details.features)
          })),
        };
      }
    }
    return { bingo: [], competition: [], hangmanLanguage: [], hangmanWordSource: [] }; 
  };

  const gameModesData = getGameModesData();


  const renderSectionTitle = (icon, text) => (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      position: 'relative',
      zIndex: 1
    }}>
      {icon}
      <Typography variant="subtitle1" sx={{
        fontWeight: 'bold',
        fontSize: '1.4rem',
        color: theme.palette.secondary.contrastText
      }}>
        {text}
      </Typography>
    </Box>
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleAccordion1Change = () => {
    setExpanded1(!expanded1);
  };

  const handleAccordion2Change = () => {
    setExpanded2(!expanded2);
  };

  let tabButtonsToRender;
  if (gameId === BINGO_GAME_ID) {
    tabButtonsToRender = (
      <>
        <Button
          variant={activeTab === 'bingo' ? 'contained' : 'outlined'}
          onClick={() => handleTabChange('bingo')}
          sx={{
            borderRadius: '20px', textTransform: 'none', px: 3, py: 0.5, fontWeight: 'bold',
            backgroundColor: activeTab === 'bingo' ? theme.palette.primary.main : 'transparent',
            borderColor: theme.palette.primary.main,
            color: activeTab === 'bingo' ? theme.palette.primary.contrastText : theme.palette.primary.main,
            '&:hover': { backgroundColor: activeTab === 'bingo' ? theme.palette.primary.medium || theme.palette.primary.main : theme.palette.background.offwhite, transform: 'translateY(-2px)', boxShadow: activeTab === 'bingo' ? `0 4px 8px ${theme.palette.background.elevation[1]}` : 'none' },
            transition: 'all 0.3s ease'
          }}
        >
          {t("tabs.bingoModes")}
        </Button>
        <Button
          variant={activeTab === 'competition' ? 'contained' : 'outlined'}
          onClick={() => handleTabChange('competition')}
          sx={{
            borderRadius: '20px', textTransform: 'none', px: 3, py: 0.5, fontWeight: 'bold',
            backgroundColor: activeTab === 'competition' ? theme.palette.primary.main : 'transparent',
            borderColor: theme.palette.primary.main,
            color: activeTab === 'competition' ? theme.palette.primary.contrastText : theme.palette.primary.main,
            '&:hover': { backgroundColor: activeTab === 'competition' ? theme.palette.primary.medium || theme.palette.primary.main : theme.palette.background.offwhite, transform: 'translateY(-2px)', boxShadow: activeTab === 'competition' ? `0 4px 8px ${theme.palette.background.elevation[1]}` : 'none' },
            transition: 'all 0.3s ease'
          }}
        >
          {t("tabs.competitionStyles")}
        </Button>
      </>
    );
  } else if (gameId === HANGMAN_GAME_ID) {
    tabButtonsToRender = (
      <>
        <Button
          variant={activeTab === 'hangmanLanguage' ? 'contained' : 'outlined'}
          onClick={() => handleTabChange('hangmanLanguage')}
          sx={{
            borderRadius: '20px', textTransform: 'none', px: 3, py: 0.5, fontWeight: 'bold',
            backgroundColor: activeTab === 'hangmanLanguage' ? theme.palette.primary.main : 'transparent',
            borderColor: theme.palette.primary.main,
            color: activeTab === 'hangmanLanguage' ? theme.palette.primary.contrastText : theme.palette.primary.main,
            '&:hover': { backgroundColor: activeTab === 'hangmanLanguage' ? theme.palette.primary.medium || theme.palette.primary.main : theme.palette.background.offwhite, transform: 'translateY(-2px)', boxShadow: activeTab === 'hangmanLanguage' ? `0 4px 8px ${theme.palette.background.elevation[1]}` : 'none' },
            transition: 'all 0.3s ease'
          }}
        >
          {t("tabs.hangmanLanguage")}
        </Button>
        <Button
          variant={activeTab === 'hangmanWordSource' ? 'contained' : 'outlined'}
          onClick={() => handleTabChange('hangmanWordSource')}
          sx={{
            borderRadius: '20px', textTransform: 'none', px: 3, py: 0.5, fontWeight: 'bold',
            backgroundColor: activeTab === 'hangmanWordSource' ? theme.palette.primary.main : 'transparent',
            borderColor: theme.palette.primary.main,
            color: activeTab === 'hangmanWordSource' ? theme.palette.primary.contrastText : theme.palette.primary.main,
            '&:hover': { backgroundColor: activeTab === 'hangmanWordSource' ? theme.palette.primary.medium || theme.palette.primary.main : theme.palette.background.offwhite, transform: 'translateY(-2px)', boxShadow: activeTab === 'hangmanWordSource' ? `0 4px 8px ${theme.palette.background.elevation[1]}` : 'none' },
            transition: 'all 0.3s ease'
          }}
        >
          {t("tabs.wordChoice")}
        </Button>
      </>
    );
  }

  let gameModeContentToRender;
  if (gameId === BINGO_GAME_ID) {
    gameModeContentToRender = (
      <>
        <Fade in={activeTab === 'bingo'} timeout={500} unmountOnExit>
          <Box>
            <Typography variant="h5" sx={{ color: theme.palette.secondary.gold, fontSize: '1.8rem', letterSpacing: '1px', mb: 3, textShadow: `1px 1px 1px ${theme.palette.background.elevation[3]}`, position: 'relative', display: 'inline-block', '&:after': { content: '""', position: 'absolute', bottom: '-8px', left: 0, width: '100%', height: '4px', borderRadius: '2px', background: `linear-gradient(90deg, ${theme.palette.secondary.main}, transparent)`,} }}>
              {t("sectionTitle.bingoModes")}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              {gameModesData.bingo?.map((mode) => (
                <GameModeCard key={mode.mode} mode={mode} theme={theme} />
              ))}
            </Box>
          </Box>
        </Fade>
        <Fade in={activeTab === 'competition'} timeout={500} unmountOnExit>
           <Box>
            <Typography variant="h5" sx={{ color: theme.palette.secondary.gold, fontSize: '1.8rem', letterSpacing: '1px', mb: 3, textShadow: `1px 1px 1px ${theme.palette.background.elevation[3]}`, position: 'relative', display: 'inline-block', '&:after': { content: '""', position: 'absolute', bottom: '-8px', left: 0, width: '100%', height: '4px', borderRadius: '2px', background: `linear-gradient(90deg, ${theme.palette.secondary.main}, transparent)`,} }}>
              {t("sectionTitle.competitionStyles")}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
              {gameModesData.competition?.map((mode) => (
                <GameModeCard key={mode.mode} mode={mode} theme={theme} isCompetition={true} />
              ))}
            </Box>
           </Box>
        </Fade>
      </>
    );
  } else if (gameId === HANGMAN_GAME_ID) {
    gameModeContentToRender = (
      <>
        <Fade in={activeTab === 'hangmanLanguage'} timeout={500} unmountOnExit>
           <Box>
            <Typography variant="h5" sx={{ color: theme.palette.secondary.gold, fontSize: '1.8rem', letterSpacing: '1px', mb: 3, textShadow: `1px 1px 1px ${theme.palette.background.elevation[3]}`, position: 'relative', display: 'inline-block', '&:after': { content: '""', position: 'absolute', bottom: '-8px', left: 0, width: '100%', height: '4px', borderRadius: '2px', background: `linear-gradient(90deg, ${theme.palette.secondary.main}, transparent)`,} }}>
              {t("sectionTitle.hangmanLanguageModes")}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
              {gameModesData.hangmanLanguage?.map((mode) => (
                <GameModeCard key={mode.modeKey} mode={mode} theme={theme} isCompetition={mode.isCompetition || false} />
              ))}
            </Box>
           </Box>
        </Fade>
        <Fade in={activeTab === 'hangmanWordSource'} timeout={500} unmountOnExit>
           <Box>
            <Typography variant="h5" sx={{ color: theme.palette.secondary.gold, fontSize: '1.8rem', letterSpacing: '1px', mb: 3, textShadow: `1px 1px 1px ${theme.palette.background.elevation[3]}`, position: 'relative', display: 'inline-block', '&:after': { content: '""', position: 'absolute', bottom: '-8px', left: 0, width: '100%', height: '4px', borderRadius: '2px', background: `linear-gradient(90deg, ${theme.palette.secondary.main}, transparent)`,} }}>
              {t("sectionTitle.hangmanWordSourceModes")}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
              {gameModesData.hangmanWordSource?.map((mode) => (
                <GameModeCard key={mode.modeKey} mode={mode} theme={theme} isCompetition={mode.isCompetition || false} />
              ))}
            </Box>
           </Box>
        </Fade>
      </>
    );
  }

  const gameDescription = game && game.description ? t(game.description) : t("loadingDescription");
  const gameHowToPlay = game && Array.isArray(game.howToPlay) ? game.howToPlay : [];


  return (
    <Box sx={{ pt: 3, position: 'relative' }}>
      <Box sx={{
        display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between',
        gap: 2, mb: 3, p: 2, borderRadius: '16px', background: theme.palette.background.gradientB,
        boxShadow: `0 4px 12px ${theme.palette.background.elevation[1]}`,
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 1, borderBottom: `1px solid ${theme.palette.background.offwhite}`, }}>
            <People sx={{ color: theme.palette.secondary.gold, fontSize: '28px' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.text.primary, letterSpacing: '1.5px' }}>
              {t("activePlayersTitle")}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <CustomAvatarGroup members={allMemberAvatars} max={7} getInitials={getInitials} />
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic', borderLeft: `2px solid ${theme.palette.background.offwhite}`, pl: 1, display: { xs: 'none', sm: 'block' } }}>
              {t("playersActiveCount", { count: allMemberAvatars.length })}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.text.primary, letterSpacing: '1.5px', display: 'flex', alignItems: 'center', gap: 1, pb: 1, borderBottom: `1px solid ${theme.palette.background.offwhite}`, width: '100%' }}>
            <Info sx={{ color: theme.palette.secondary.gold, fontSize: '24px' }} />
            {t("gameInfoTitle")}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, width: '100%' }}>
            <InfoChip
              icon={<SportsEsports sx={{ color: theme.palette.secondary.contrastText }} />}
              label={t("gameChip.type", { genre: game?.genre || 'N/A' })}
              tooltipText={t("gameChip.typeTooltip", { genre: game?.genre || 'N/A' })}
              theme={theme}
            />
            <InfoChip
              icon={<EmojiEvents sx={{ color: theme.palette.secondary.contrastText }} />}
              label={t("gameChip.competitive")}
              tooltipText={t("gameChip.competitiveTooltip")}
              theme={theme}
            />
            <InfoChip
              icon={<Favorite sx={{ color: theme.palette.secondary.contrastText }} />}
              label={t("gameChip.lobbies", { count: filteredLobbies.length })}
              tooltipText={t("gameChip.lobbiesTooltip", { count: filteredLobbies.length })}
              theme={theme}
            />
          </Box>
        </Box>
      </Box>

      <Paper elevation={3} sx={{
        backgroundColor: theme.palette.background.paper, padding: { xs: 2, sm: 3 }, borderRadius: '16px',
        borderLeft: `4px solid ${theme.palette.primary.main}`, mb: 3, position: 'relative', overflow: 'hidden',
        '&:after': { content: '""', position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: `radial-gradient(circle, ${theme.palette.background.offwhite} 0%, transparent 70%)`, opacity: 0.4, zIndex: 0 }
      }}>
        <Typography variant="body1" paragraph sx={{ color: theme.palette.text.primary, lineHeight: 1.6, margin: 0, position: 'relative', zIndex: 1 }}>
         {gameDescription}
        </Typography>
      </Paper>

      <Accordion expanded={expanded1} onChange={handleAccordion1Change} sx={{
        mt: 3, background: 'transparent', '&:before': { display: 'none' }, boxShadow: 'none',
        borderRadius: '12px', overflow: 'hidden'
      }}>
        <AccordionSummary sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.medium || theme.palette.primary.main} 100%)`,
          borderRadius: '12px', color: theme.palette.secondary.contrastText, minHeight: '64px !important', height: '64px',
          '&:hover': { background: `linear-gradient(135deg, ${theme.palette.primary.dark || theme.palette.primary.main} 0%, ${theme.palette.primary.medium || theme.palette.primary.main} 100%)`,}
        }}>
          {renderSectionTitle( <EmojiEvents sx={{ fontSize: '28px' }} />, t("accordionTitle.gameModesAndRules"))}
          <ExpandMore sx={{ color: theme.palette.secondary.contrastText, transition: 'transform 0.3s ease', transform: expanded1 ? 'rotate(180deg)' : 'rotate(0deg)', position: 'absolute', right: '16px' }}/>
        </AccordionSummary>
        <AccordionDetails sx={{
          background: theme.palette.background.paper, borderRadius: '16px', mt: 1,
          padding: { xs: 2, sm: 3 }, boxShadow: `0 4px 20px ${theme.palette.background.elevation[2]}`
        }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, borderBottom: `1px solid ${theme.palette.background.offwhite}`, pb: 1 }}>
            {tabButtonsToRender}
          </Box>
          {gameModeContentToRender}
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expanded2} onChange={handleAccordion2Change} sx={{
        mt: 3, background: 'transparent', '&:before': { display: 'none' }, boxShadow: 'none',
        borderRadius: '12px', overflow: 'hidden'
      }}>
        <AccordionSummary sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.medium || theme.palette.primary.main} 100%)`,
          borderRadius: '12px', color: theme.palette.secondary.contrastText, minHeight: '64px !important', height: '64px',
          '&:hover': { background: `linear-gradient(135deg, ${theme.palette.primary.dark || theme.palette.primary.main} 0%, ${theme.palette.primary.medium || theme.palette.primary.main} 100%)`,}
        }}>
          {renderSectionTitle( <Help sx={{ fontSize: '28px' }} />, t("accordionTitle.howToPlay"))}
          <ExpandMore sx={{ color: theme.palette.secondary.contrastText, transition: 'transform 0.3s ease', transform: expanded2 ? 'rotate(180deg)' : 'rotate(0deg)', position: 'absolute', right: '16px' }}/>
        </AccordionSummary>
        <AccordionDetails sx={{
          background: theme.palette.background.paper, borderRadius: '16px', mt: 1,
          padding: { xs: 2, sm: 3 }, boxShadow: `0 4px 20px ${theme.palette.background.elevation[2]}`,
          position: 'relative', overflow: 'hidden',
          '&:before': { content: '""', position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: theme.palette.background.stripeBg, opacity: 0.05, borderRadius: '0 0 0 100%', zIndex: 0 }
        }}>
          <List sx={{ position: 'relative', zIndex: 1 }}>
            {gameHowToPlay.map((stepKey, index) => (
              <ListItem key={index} sx={{
                py: 1, position: 'relative', pl: 4, transition: 'all 0.2s ease',
                '&:hover': { background: theme.palette.background.offwhite, borderRadius: '8px' },
                '&:before': { content: '""', position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '24px', height: '24px', borderRadius: '50%', background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.palette.primary.contrastText, fontWeight: 'bold', fontSize: '0.8rem', boxShadow: `0 2px 4px ${theme.palette.background.elevation[1]}` },
                '&:after': { content: `"${index + 1}"`, position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.palette.primary.contrastText, fontWeight: 'bold', fontSize: '0.8rem', zIndex: 1 }
              }}>
                <ListItemText
                  primaryTypographyProps={{ color: theme.palette.text.primary, fontSize: '1.1rem', fontWeight: 500 }}
                  primary={t(stepKey)}
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