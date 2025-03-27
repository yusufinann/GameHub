import React, { useState } from 'react';
import { LobbyList } from './components/LobbyList';
import { useLobbyContext } from '../context';
import CreateLobbyArea from './components/CreateLobbyArea';


function LobbiesArea (){
  const { lobbies } = useLobbyContext(); 
  const [activeTab, setActiveTab] = useState('all');
  return (
   <>
      <CreateLobbyArea  activeTab={activeTab} setActiveTab={setActiveTab}/>
      <LobbyList lobbies={lobbies} activeTab={activeTab}/>
   </>
  );
};

export default LobbiesArea;