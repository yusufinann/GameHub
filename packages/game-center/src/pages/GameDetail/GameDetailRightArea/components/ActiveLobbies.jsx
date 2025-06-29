import React, { memo, useMemo } from 'react';
import { Card, CardContent, Typography, useTheme, Box, Divider } from '@mui/material';
import { People } from '@mui/icons-material';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import NoActiveLobbies from './NoActiveLobbies';
import LobbyItem from '../../../../shared/components/LobbyItem/LobbyItem';
import { useTranslation } from 'react-i18next';

const Row = memo(({ index, style, data }) => {
  const { lobbies, theme } = data;
  const lobby = lobbies[index];
  const isLastItem = index === lobbies.length - 1;

  return (
    <Box style={style}>
      <LobbyItem lobby={lobby} isOpen={true} />
      {!isLastItem && (
        <Divider
          sx={{
            mx: 1,
            backgroundColor: `${theme.palette.divider}80`,
          }}
        />
      )}
    </Box>
  );
});

const ActiveLobbies = ({ filteredLobbies }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const itemData = useMemo(() => ({
    lobbies: filteredLobbies,
    theme: theme,
  }), [filteredLobbies, theme]);
  
  const ITEM_SIZE = 150;

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: theme.shadows[8],
        bgcolor: theme.palette.primary.main,
        position: 'relative',
        display: 'flex', 
        flexDirection: 'column', 
        height: '65vh',
      }}
    >
      <CardContent
        sx={{
          background: theme.palette.background.stripeBg,
          pt: 2,
          pb: 0,
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1, 
          overflow: 'hidden', 
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

        <Box sx={{ flexGrow: 1, width: '100%' }}>
          {filteredLobbies.length > 0 ? (
            <AutoSizer>
              {({ height, width }) => (
                <List
                  height={height}
                  width={width}
                  itemCount={filteredLobbies.length}
                  itemSize={ITEM_SIZE}
                  itemData={itemData}
                  overscanCount={5}
                >
                  {Row}
                </List>
              )}
            </AutoSizer>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <NoActiveLobbies />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default memo(ActiveLobbies);