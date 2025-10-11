module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Remove ESLint plugin if it's causing issues
      webpackConfig.plugins = webpackConfig.plugins.filter(
        plugin => plugin.constructor.name !== 'ESLintWebpackPlugin'
      );
      return webpackConfig;
    },
  },
  devServer: (devServerConfig) => {
    // Remove deprecated properties
    delete devServerConfig.onBeforeSetupMiddleware;
    delete devServerConfig.onAfterSetupMiddleware;
    
    // Remove https if it's causing issues (keep it simple for development)
    delete devServerConfig.https;
    
    // Add new setupMiddlewares property
    devServerConfig.setupMiddlewares = (middlewares) => {
      return middlewares;
    };
    
    return devServerConfig;
  },
};
