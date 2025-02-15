
// /datas/users.js
import bcrypt from 'bcrypt';
const users = [
  {
    id: 1,
    email: "user1@example.com",
    password: bcrypt.hashSync("password1", 10),
    name: "John Doe",
    username: "johndoe",
    avatar: "https://example.com/avatar1.jpg",
    friends: [], // Arkadaş ID'lerini tutan array
    friendRequests: [], // Gelen arkadaşlık isteklerinin ID'lerini tutan array
    outgoingRequests: []
  },
  {
    id: 2,
    email: "user2@example.com",
    password: bcrypt.hashSync("password2", 10),
    name: "Jane Smith",
    username: "janesmith",
    avatar: "https://example.com/avatar2.jpg",
    friends: [], // Arkadaş ID'lerini tutan array
    friendRequests: [], // Gelen arkadaşlık isteklerinin ID'lerini tutan array
    outgoingRequests: []
  },
  {
    id: 3,
    email: "user3@example.com",
    password: bcrypt.hashSync("password3", 10),
    name: "Alice Johnson",
    username: "alicejohnson",
    avatar: "https://example.com/avatar3.jpg",
    friends: [], // Arkadaş ID'lerini tutan array
    friendRequests: [], // Gelen arkadaşlık isteklerinin ID'lerini tutan array
    outgoingRequests: []
  },
  {
    id: 4,
    email: "user4@example.com",
    password: bcrypt.hashSync("password4", 10),
    name: "Bob Brown",
    username: "bobbrown",
    avatar: "https://example.com/avatar4.jpg",
    friends: [], // Arkadaş ID'lerini tutan array
    friendRequests: [], // Gelen arkadaşlık isteklerinin ID'lerini tutan array
    outgoingRequests: []
  },
  {
    id: 5,
    email: "user5@example.com",
    password: bcrypt.hashSync("password5", 10),
    name: "Charlie Davis",
    username: "charliedavis",
    avatar: "https://example.com/avatar5.jpg",
    friends: [], // Arkadaş ID'lerini tutan array
    friendRequests: [], // Gelen arkadaşlık isteklerinin ID'lerini tutan array 
    outgoingRequests: []
  },
];
const getUserById = (id) => users.find(user => user.id === id);
const getUserByEmail = (email) => users.find(user => user.email === email);
const updateUser = (userId, updates) => {
  const index = users.findIndex(user => user.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    return users[index];
  }
  return null;
};

export { users, getUserById, getUserByEmail, updateUser };