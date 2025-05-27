import React from 'react';
import { Card, CardContent, Typography, List, useTheme, Box, Divider } from '@mui/material';
import { People } from '@mui/icons-material';
import NoActiveLobbies from './NoActiveLobbies';
import LobbyItem from '../../../../shared/components/LobbyItem/LobbyItem';
import { useTranslation } from 'react-i18next';

function ActiveLobbies({ filteredLobbies }) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: theme.shadows[8],
        bgcolor: theme.palette.primary.main,
        position: 'relative',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          boxShadow: theme.shadows[12],
        },
        display: 'flex', 
        flexDirection: 'column', 
        maxHeight: '65vh', 
      }}
    >
      <CardContent
        sx={{
          background: theme.palette.background.stripeBg,
          pt: 2,
          pb: filteredLobbies.length > 0 ? 0 : 2,
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1, 
          overflow: 'hidden', 
          minHeight: 0, 
        }}
      >
        <Typography
          variant="h6"
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: theme.palette.primary.contrastText,
            fontWeight: 'bold',
            mb: 2,
            flexShrink: 0, 
          }}
        >
          <People sx={{ mr: 1 }} />
          {t("Active Lobbies")}
        </Typography>

        {filteredLobbies.length > 0 ? (
          <List
            sx={{
              overflowY: 'auto', 
              flexGrow: 1, 
            }}
          >
            {filteredLobbies.map((lobby, index) => (
              <React.Fragment key={lobby.id || lobby.lobbyCode}>
                <LobbyItem lobby={lobby} isOpen={true} />
                {index < filteredLobbies.length - 1 && (
                  <Divider sx={{
                      mx: 1,
                      backgroundColor: `${theme.palette.divider}80`
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              flexGrow: 1, 
            }}
          >
            <NoActiveLobbies />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default ActiveLobbies;