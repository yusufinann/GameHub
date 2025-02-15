import game2Valo from '../assets/game-valo.png';
import game2 from '../assets/game2.png'
export const GAMES = [
  {
    id: 1,
    title: "Bingo",
    image: "https://eddra.com/edadmin/uploads/image/online-takim-aktiviteleri/online-tombala/2-550x400.jpg",
    genre: "Adventure",
    rating: 4.5,
    playTime: "20min",
    description: "Klasik Bingo deneyimini online olarak yaşayın! Rastgele çekilen numaralarla kartınızı doldurun ve 'Bingo!' diye bağıran ilk kişi olun.",
    howToPlay: [
      "Her oyuncuya rastgele bir Bingo kartı dağıtılır",
      "Sunucu rastgele numaralar çeker",
      "Çekilen numara kartınızda varsa işaretleyin",
      "Yatay, dikey veya çapraz tamamlanan ilk satırda Bingo diyerek kazanın",
    ]
  },
  {
    id: 2,
    title: "Uno",
    image: "https://cdn2.unrealengine.com/Diesel%2Fproductv2%2Funo%2Fhome%2FGameName_Store_Landscape_2560x1440-2560x1440-5195e8a3e06d672f97a1ee49ecea59027c14cae4.jpg",
    genre: "Sci-Fi",
    rating: 4.8,
    playTime: "15min",
    description: "Klasik Bingo deneyimini online olarak yaşayın! Rastgele çekilen numaralarla kartınızı doldurun ve 'Bingo!' diye bağıran ilk kişi olun.",
    howToPlay: [
      "Her oyuncuya rastgele bir Bingo kartı dağıtılır",
      "Sunucu rastgele numaralar çeker",
      "Çekilen numara kartınızda varsa işaretleyin",
      "Yatay, dikey veya çapraz tamamlanan ilk satırda Bingo diyerek kazanın",
    ]
  },
  {
    id: 3,
    title: "Chess",
    image: "https://www.shutterstock.com/shutterstock/photos/1258437028/display_1500/stock-photo-logic-chess-game-logo-simple-illustration-of-logic-chess-game-logo-for-web-design-isolated-on-1258437028.jpg",
    genre: "Fantasy",
    rating: 4.2,
    playTime: "25min",
    description: "Klasik Bingo deneyimini online olarak yaşayın! Rastgele çekilen numaralarla kartınızı doldurun ve 'Bingo!' diye bağıran ilk kişi olun.",
    howToPlay: [
      "Her oyuncuya rastgele bir Bingo kartı dağıtılır",
      "Sunucu rastgele numaralar çeker",
      "Çekilen numara kartınızda varsa işaretleyin",
      "Yatay, dikey veya çapraz tamamlanan ilk satırda Bingo diyerek kazanın",
    ]
  },
  {
    id: 4,
    title: "HangMan",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ63bZ9-d9KLHmXM7kXcxhBTIG--ZPlT64tcQ&s",
    genre: "Racing",
    rating: 4.6,
    playTime: "10min",
    description: "Klasik Bingo deneyimini online olarak yaşayın! Rastgele çekilen numaralarla kartınızı doldurun ve 'Bingo!' diye bağıran ilk kişi olun.",
    howToPlay: [
      "Her oyuncuya rastgele bir Bingo kartı dağıtılır",
      "Sunucu rastgele numaralar çeker",
      "Çekilen numara kartınızda varsa işaretleyin",
      "Yatay, dikey veya çapraz tamamlanan ilk satırda Bingo diyerek kazanın",
    ]
  }
];
export const gameData = [
    {
      id: 1,
      title: 'Valorant',
      description: 'A 5v5 character-based tactical shooter where precise gunplay meets unique agent abilities.',
      reviews: 53,
      price: 'Free to Play',
      image: game2Valo,
      coverImage: '/api/placeholder/1920/1080',
      gif: 'https://media.giphy.com/media/9lHsP26ijVJwylXsff/giphy.gif',
      genre: 'Tactical Shooter',
      rating: 4.8,
      players: '12M+',
      releaseDate: '2021'
    },
    {
      id: 2,
      title: 'Cyberpunk 2077',
      description: 'An open-world action-adventure RPG set in Night City, a megalopolis obsessed with power, glamour and body modification.',
      reviews: 42,
      price: '$59.99',
      image: game2,
      coverImage: '/api/placeholder/1920/1080',
      gif: 'https://media.giphy.com/media/Y78oxfEoPs23JShh1Z/giphy.gif',
      genre: 'RPG',
      rating: 4.5,
      players: '8M+',
      releaseDate: '2020'
    },
  ];
