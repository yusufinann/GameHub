
const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // `components` dizinine alias ekleyerek çözüm sağlıyoruz
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@components': path.resolve(__dirname, '../bingo-game/src'),
      };

      // `babel-loader`'ı, dış bileşenlerin doğru şekilde işlenmesi için yapılandırma
      const { getLoader, loaderByName } = require('@craco/craco');
      const { isFound, match } = getLoader(webpackConfig, loaderByName('babel-loader'));

      if (isFound) {
        const include = Array.isArray(match.loader.include) ? match.loader.include : [match.loader.include];
        include.push(path.resolve(__dirname, '../bingo-game/src'));  // concat yerine push kullanıyoruz
        match.loader.include = include;
      }

      return webpackConfig;
    },
  },
};