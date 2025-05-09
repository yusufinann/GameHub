const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Alias eklemeleri
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@components': path.resolve(__dirname, '../bingo-game/src'),
        '@hangman': path.resolve(__dirname, '../hangman-game/src'),
      };

      // Babel loader yapılandırması
      const { getLoader, loaderByName } = require('@craco/craco');
      const { isFound, match } = getLoader(webpackConfig, loaderByName('babel-loader'));

      if (isFound) {
        const include = Array.isArray(match.loader.include) ? match.loader.include : [match.loader.include];
        include.push(path.resolve(__dirname, '../bingo-game/src'));
        include.push(path.resolve(__dirname, '../hangman-game/src'));
        match.loader.include = include;
      }

      return webpackConfig;
    },
  },
};
