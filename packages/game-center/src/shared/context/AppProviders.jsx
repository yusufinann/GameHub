import React from 'react';
import { WebSocketProvider } from './WebSocketContext/context';
import { SnackbarProvider } from './SnackbarContext';
import { TurnNotificationProvider } from '../components/GlobalTurnNotification/context';
import { LobbyProvider } from './LobbyContext/context';
import { GlobalNotificationProvider } from '../../pages/FriendsSidebar/context';
import { FriendsProvider } from './FriendsContext/context';

const AppProviders = ({ children }) => {
  return (
    <WebSocketProvider>
      <SnackbarProvider>
        <TurnNotificationProvider>
          <LobbyProvider>
            <GlobalNotificationProvider>
              <FriendsProvider>
                {children}
              </FriendsProvider>
            </GlobalNotificationProvider>
          </LobbyProvider>
        </TurnNotificationProvider>
      </SnackbarProvider>
    </WebSocketProvider>
  );
};

export default AppProviders;