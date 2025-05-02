import game2Valo from "../assets/game-valo.png";
import game2 from "../assets/game2.png";
export const GAMES = [
  {
    id: 1,
    title: "Bingo",
    image:
      "https://eddra.com/edadmin/uploads/image/online-takim-aktiviteleri/online-tombala/2-550x400.jpg",
    genre: "Adventure",
    rating: 4.5,
    playTime: "20min",
    description:
      "Bingo fun is just a click away! Mark off your lucky numbers and be the first to yell 'Bingo!' in all the excitement!",
    howToPlay: [
      "Each player receives a random Bingo card",
      "The host draws numbers at random",
      "Mark the number on your card if it's been called",
      "Be the first to complete a row horizontally, vertically, or diagonally and shout 'Bingo!' to win",
    ],
  },
  {
    id: 2,
    title: "Uno",
    image:
      "https://cdn2.unrealengine.com/Diesel%2Fproductv2%2Funo%2Fhome%2FGameName_Store_Landscape_2560x1440-2560x1440-5195e8a3e06d672f97a1ee49ecea59027c14cae4.jpg",
    genre: "Sci-Fi",
    rating: 4.8,
    playTime: "15min",
    description:
      "Get ready for fast-paced fun with Uno! Match colors or numbers, play action cards, and be the first to get rid of all your cards!",
    howToPlay: [
      "Each player is dealt 7 cards at the start",
      "Take turns matching the top card by color or number",
      "Use action cards to skip, reverse, or draw cards",
      "When you have one card left, shout 'UNO!'",
      "The first player to play all their cards wins",
    ],
  },
  {
    id: 3,
    title: "Chess",
    image:
      "https://www.shutterstock.com/shutterstock/photos/1258437028/display_1500/stock-photo-logic-chess-game-logo-simple-illustration-of-logic-chess-game-logo-for-web-design-isolated-on-1258437028.jpg",
    genre: "Fantasy",
    rating: 4.2,
    playTime: "25min",
    description:
      "Test your strategy and logic in the timeless game of Chess. Outsmart your opponent and checkmate the king to win the match!",
    howToPlay: [
      "Each player starts with 16 pieces: pawns, knights, bishops, rooks, a queen, and a king",
      "Players take turns moving one piece per turn",
      "Use strategy to protect your king and attack your opponent’s pieces",
      "Capture pieces by moving into their square",
      "Win by putting the opponent’s king in a position where it cannot escape: checkmate",
    ],
  },
  {
    id: 4,
    title: "HangMan",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ63bZ9-d9KLHmXM7kXcxhBTIG--ZPlT64tcQ&s",
    genre: "Racing",
    rating: 4.6,
    playTime: "10min",
    description:
      "Guess the word before the stick figure is fully drawn! Use logic and vocabulary to uncover the hidden word letter by letter.",
    howToPlay: [
      "One player thinks of a word and marks blanks for each letter",
      "The other player guesses letters one at a time",
      "Correct guesses reveal the letter in the word",
      "Incorrect guesses add parts to the hangman drawing",
      "The guessing player wins by revealing the word before the hangman is fully drawn",
    ],
  },
];

export const gameData = [
  {
    id: 1,
    title: "Valorant",
    description:
      "A 5v5 character-based tactical shooter where precise gunplay meets unique agent abilities.",
    reviews: 53,
    price: "Free to Play",
    image: game2Valo,
    coverImage: "/api/placeholder/1920/1080",
    gif: "https://media.giphy.com/media/9lHsP26ijVJwylXsff/giphy.gif",
    genre: "Tactical Shooter",
    rating: 4.8,
    players: "12M+",
    releaseDate: "2021",
  },
  {
    id: 2,
    title: "Cyberpunk 2077",
    description:
      "An open-world action-adventure RPG set in Night City, a megalopolis obsessed with power, glamour and body modification.",
    reviews: 42,
    price: "$59.99",
    image: game2,
    coverImage: "/api/placeholder/1920/1080",
    gif: "https://media.giphy.com/media/Y78oxfEoPs23JShh1Z/giphy.gif",
    genre: "RPG",
    rating: 4.5,
    players: "8M+",
    releaseDate: "2020",
  },
];
