import gameOfThrones from "../../../assets/headerGame3.png"; // Yolu kendi projenize göre ayarlayın
import fortnite from "../../../assets/fortnite-removebg.png"; // Yolu kendi projenize göre ayarlayın
import oblivion from "../../../assets/oblivion-removebg.png"; // Yolu kendi projenize göre ayarlayın

export const getSlidesData = (theme) => [
  {
    id: 1,
    titleKey: "mainScreen.slide1.title",
    buttonTextKey: "mainScreen.slide1.buttonText",
    characterImg: gameOfThrones,
    color: theme.palette.primary.main,
  },
  {
    id: 2,
    titleKey: "mainScreen.slide2.title",
    buttonTextKey: "mainScreen.slide2.buttonText",
    characterImg: fortnite,
    color: theme.palette.primary.main,
  },
  {
    id: 3,
    titleKey: "mainScreen.slide3.title",
    buttonTextKey: "mainScreen.slide3.buttonText",
    characterImg: oblivion,
    color: theme.palette.primary.main,
  },
];