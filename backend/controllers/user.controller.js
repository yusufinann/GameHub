// controllers/user.controller.js
import { users } from "../datas/users.js";

export const getCurrentUser = (req, res) => {
  try {
    const user = req.user;
    return res.json({ 
      email: user.email, 
      name: user.name, 
      avatar: user.avatar 
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const searchUsers = (req, res) => {
  try {
    const { username } = req.query;

    if (!username || username.length < 2) {
      return res.json([]);
    }

    const filteredUsers = users
      .filter(user => 
        user.username.toLowerCase().includes(username.toLowerCase()) &&
        user.id !== req.user.id
      )
      .slice(0, 10); // Maximum 10 results

    return res.json(filteredUsers);
    
  } catch (error) {
    console.error('Error searching users:', error);
    return res.status(500).json([]);
  }
};

export const getUserById = (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = users.find(user => user.id === id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      friends: user.friends, 
    friendRequests: user.friendRequests, 
    });

  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};