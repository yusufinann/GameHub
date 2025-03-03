

// controllers/user.controller.js
import User from "../models/user.model.js";
import bcrypt from "bcrypt";

// Yeni kullanıcı ekleme (Postman'dan test için)
export const createUser = async (req, res) => {
  try {
    const { email, password, name, username, avatar } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });    
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      username,
      avatar,
      friends: [],
      friendRequests: [],
      outgoingRequests: [],
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully" });

  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const searchUsers = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username || username.length < 2) {
      return res.json([]);
    }

    const users = await User.find({
      username: { $regex: username, $options: "i" },
      _id: { $ne: req.user._id }
    }).select("id username name avatar").limit(10);

    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json([]);
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("email name avatar");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
