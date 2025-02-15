import express from 'express';
import {
  createLobby,joinLobby,getLobbyByCode,getLobbies,deleteLobby,leaveLobby
} from '../controllers/lobby.controller.js';
import authenticateUser from '../middleware/authenticateUser.js';

const router = express.Router();

// Get all lobbies
router.get('/', authenticateUser, getLobbies);

// Get specific lobby by code
router.get('/:lobbyCode', authenticateUser, getLobbyByCode);

// Create new lobby
router.post('/create', authenticateUser, createLobby);

// Join existing lobby
router.post('/join/:lobbyCode', authenticateUser, joinLobby);

// Leave lobby
router.post('/leave/:lobbyCode', authenticateUser, leaveLobby);


// Delete lobby (only for host)
router.delete('/delete/:lobbyCode', authenticateUser, deleteLobby);

// // Update lobby settings (only for host)
// router.put('/:lobbyCode', authenticateUser, updateLobby);


export default router;