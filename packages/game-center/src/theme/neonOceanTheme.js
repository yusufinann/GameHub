import { createTheme } from '@mui/material/styles';
import { neonOceanPalette } from './palette';

const neonOceanTheme = createTheme({
  palette: neonOceanPalette,
  // İsteğe bağlı olarak diğer tema özelleştirmeleri buraya eklenebilir (tipografi, gölgeler vb.)
});

export default neonOceanTheme;