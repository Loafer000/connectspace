module.exports = function override(config, env) {
  // Remove the onAfterSetupMiddleware property that's causing the error
  if (config.devServer) {
    delete config.devServer.onAfterSetupMiddleware;
    delete config.devServer.onBeforeSetupMiddleware;
    
    // Use the new setupMiddlewares API instead
    config.devServer.setupMiddlewares = (middlewares, devServer) => {
      return middlewares;
    };
  }
  
  return config;
};
