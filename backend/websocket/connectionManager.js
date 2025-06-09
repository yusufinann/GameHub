export const handleNewClient = (ws, request, connectedClients) => {
    try {
        const url = new URL(request.url, `ws://${request.headers.host}`); // Use actual host
        const userId = url.searchParams.get("userId");

        if (userId) {
            const existingWs = connectedClients.get(userId);
            if (existingWs && existingWs !== ws) {
                existingWs.terminate();
            }

            ws.userId = userId;
            ws.isAlive = true;
            connectedClients.set(userId, ws);
            console.log(`Client connected: ${userId} (Total: ${connectedClients.size})`);
            return true; 
        } else {
            ws.close(1008, "User ID is required"); 
            return false;
        }
    } catch (error) {
        console.error("Error processing new connection:", error);
        ws.close(1011, "Server error during connection setup"); 
        return false; 
    }
};

export const handleClientDisconnect = (ws, connectedClients) => {
    if (ws.userId) {
        connectedClients.delete(ws.userId);
        console.log(`Client disconnected: ${ws.userId} (Total: ${connectedClients.size})`);
    } else {
        console.log("Unidentified client disconnected.");
    }
};

export const handlePong = (ws) => {
    ws.isAlive = true;
};

export const setupPing = (connectedClients) => {
    const interval = setInterval(() => {
        connectedClients.forEach((clientWs, userId) => {
            if (!clientWs.isAlive) {
                clientWs.terminate(); 
                return; 
            }

            clientWs.isAlive = false;
            if (clientWs.readyState === clientWs.OPEN) {
                clientWs.ping((err) => {
                    if (err) {
                        console.error(`Ping error to ${userId}:`, err);
                    }
                });
            }
        });
    }, 30000); 

    return interval; 
};