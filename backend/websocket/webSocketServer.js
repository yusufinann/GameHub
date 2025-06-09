import { WebSocketServer } from "ws";
import { createBroadcasters } from "./broadcasting.js";
import { routeMessage } from "./messageRouter.js";
import { handleNewClient, handleClientDisconnect, handlePong, setupPing } from "./connectionManager.js";

import * as lobbyController from "../controllers/lobby.controller.js";
import * as authController from "../controllers/auth.controller.js";
import * as groupChatController from "../controllers/groupChat.controller.js";
import * as friendGroupChatController from "../controllers/friendGroupChat.controller.js";

export const connectedClients = new Map(); 

const setupWebSocket = (server) => {
    const wss = new WebSocketServer({ server });

    const broadcasters = createBroadcasters(connectedClients);

    const pingInterval = setupPing(connectedClients);

    wss.on("connection", (ws, request) => {
        if (!handleNewClient(ws, request, connectedClients)) {
            return; 
        }

        ws.on("message", (message) => {
            routeMessage(ws, message, broadcasters);
        });

        ws.on("pong", () => {
            handlePong(ws);
        });

        ws.on("close", (code, reason) => {
            handleClientDisconnect(ws, connectedClients);
        });

        ws.on("error", (error) => {
            console.error(`WebSocket error for ${ws.userId || 'unknown'}:`, error);
             handleClientDisconnect(ws, connectedClients);
             if (ws.readyState === ws.OPEN || ws.readyState === ws.CONNECTING) {
                 ws.terminate();
             }
        });
    });

    wss.on("close", () => {
        clearInterval(pingInterval);
        connectedClients.clear();
    });

    wss.on("error", (error) => {
        console.error("WebSocket Server error:", error);
    });

    lobbyController.initializeWebSocket({
        broadcastLobbyEvent: broadcasters.broadcastLobbyEvent,
        broadcastToAll: broadcasters.broadcastToAll,
        broadcastToSpecificUsers: broadcasters.broadcastToSpecificUsers,
    });

    friendGroupChatController.initializeFriendGroupChatWebSocket({
        broadcastFriendGroupEvent: broadcasters.broadcastFriendGroupEvent,
        broadcastToAll: broadcasters.broadcastToAll,
        sendToSpecificUser: broadcasters.sendToSpecificUser,
        broadcastFriendGroupMessage: broadcasters.broadcastFriendGroupMessage,
        broadcastFriendEvent: broadcasters.broadcastFriendEvent, // Pass this specifically
    });

    groupChatController.initializeGroupChatWebSocket({
        broadcastGroupEvent: broadcasters.broadcastGroupEvent,
        broadcastToAll: broadcasters.broadcastToAll,
        sendToSpecificUser: broadcasters.sendToSpecificUser,
        broadcastGroupMessage: broadcasters.broadcastGroupMessage,
    });

    authController.initializeFriendWebSocket(broadcasters.broadcastFriendEvent); 

    return {
        broadcastLobbyEvent: broadcasters.broadcastLobbyEvent,
        broadcastFriendEvent: broadcasters.broadcastFriendEvent,
        broadcastToAll: broadcasters.broadcastToAll,
        getConnectedClientsCount: () => connectedClients.size,
        sendToSpecificUser: broadcasters.sendToSpecificUser
    };
};

export default setupWebSocket;