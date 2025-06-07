import game2Valo from "../assets/game-valo.png";
import game2 from "../assets/game2.png";

export const GAMES = [
  {
    id: 1,
    title: "Bingo", // Original title used as a key
    translationKey: "games.Bingo",
    image:
      "https://images.pexels.com/photos/8803363/pexels-photo-8803363.jpeg?auto=compress&cs=tinysrgb&w=600",
    genre: "Adventure",
    rating: 4.5,
    playTime: "20min",
    description: "games.Bingo.description",
    howToPlay: [
      "games.Bingo.howToPlay.0",
      "games.Bingo.howToPlay.1",
      "games.Bingo.howToPlay.2",
      "games.Bingo.howToPlay.3",
    ],
  },
   {
    id: 2,
    title: "HangMan",
    translationKey: "games.HangMan",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ63bZ9-d9KLHmXM7kXcxhBTIG--ZPlT64tcQ&s",
    genre: "Racing",
    rating: 4.6,
    playTime: "10min",
    description: "games.HangMan.description",
    howToPlay: [
      "games.HangMan.howToPlay.0",
      "games.HangMan.howToPlay.1",
      "games.HangMan.howToPlay.2",
      "games.HangMan.howToPlay.3",
      "games.HangMan.howToPlay.4",
    ],
  },
  {
    id: 3,
    title: "Uno",
    translationKey: "games.Uno",
    image:
      "https://cdn2.unrealengine.com/Diesel%2Fproductv2%2Funo%2Fhome%2FGameName_Store_Landscape_2560x1440-2560x1440-5195e8a3e06d672f97a1ee49ecea59027c14cae4.jpg",
    genre: "Sci-Fi",
    rating: 4.8,
    playTime: "15min",
    description: "games.Uno.description",
    howToPlay: [
      "games.Uno.howToPlay.0",
      "games.Uno.howToPlay.1",
      "games.Uno.howToPlay.2",
      "games.Uno.howToPlay.3",
      "games.Uno.howToPlay.4",
    ],
  },
  {
    id: 4,
    title: "Chess",
    translationKey: "games.Chess",
    image:
      "https://www.shutterstock.com/shutterstock/photos/1258437028/display_1500/stock-photo-logic-chess-game-logo-simple-illustration-of-logic-chess-game-logo-for-web-design-isolated-on-1258437028.jpg",
    genre: "Fantasy",
    rating: 4.2,
    playTime: "25min",
    description: "games.Chess.description",
    howToPlay: [
      "games.Chess.howToPlay.0",
      "games.Chess.howToPlay.1",
      "games.Chess.howToPlay.2",
      "games.Chess.howToPlay.3",
      "games.Chess.howToPlay.4",
    ],
  },
 
];

export const gameData = [
  {
    id: 1,
    title: "Valorant",
    translationKey: "gameData.Valorant",
    description: "gameData.Valorant.description",
    reviews: 53,
    price: "Free to Play",
    image: game2Valo,
    coverImage: "/api/placeholder/1920/1080",
    gif: "https://media.giphy.com/media/9lHsP26ijVJwylXsff/giphy.gif",
    genre: "gameData.Valorant.genre",
    rating: 4.8,
    players: "12M+",
    releaseDate: "2021",
  },
  {
    id: 2,
    title: "Cyberpunk 2077",
    translationKey: "gameData.Cyberpunk",
    description: "gameData.Cyberpunk.description",
    reviews: 42,
    price: "$59.99",
    image: game2,
    coverImage: "/api/placeholder/1920/1080",
    gif: "https://media.giphy.com/media/Y78oxfEoPs23JShh1Z/giphy.gif",
    genre: "gameData.Cyberpunk.genre",
    rating: 4.5,
    players: "8M+",
    releaseDate: "2020",
  },
];