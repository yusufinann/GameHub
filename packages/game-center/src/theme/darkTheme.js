import { createTheme } from '@mui/material/styles';
import { darkPalette } from './palette';

const darkTheme = createTheme({
  palette: darkPalette,
  // İsteğe bağlı olarak diğer tema özelleştirmeleri buraya eklenebilir
});

export default darkTheme;