import { createTheme } from '@mui/material/styles';
import { lightPalette } from './palette';

const lightTheme = createTheme({
  palette: lightPalette,
  // İsteğe bağlı olarak diğer tema özelleştirmeleri buraya eklenebilir (tipografi, gölgeler vb.)
});

export default lightTheme;