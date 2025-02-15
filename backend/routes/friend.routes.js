// import express from 'express'
// import { sendFriendRequest ,acceptFriendRequest,rejectFriendRequest,deleteFriendRequest,getFriendList,getFriendRequest, getOutgoingFriendRequests, getFriendStatus} from "../controllers/friend.controller.js";
// import authenticateUser from "../middleware/authenticateUser.js";

// const router = express.Router();

// router.post("/request",authenticateUser, sendFriendRequest);
// router.post("/accept",authenticateUser, acceptFriendRequest);
// router.post("/reject", authenticateUser,rejectFriendRequest);
// router.delete("/:friendId",authenticateUser, deleteFriendRequest);
// router.get("/",authenticateUser, getFriendList);
// router.get("/request",authenticateUser,getFriendRequest)
// router.get("/outgoing",authenticateUser, getOutgoingFriendRequests);
// router.get("/status", authenticateUser, getFriendStatus);

// export default router;