module.exports = function override(config, env) {
  if (env === 'production') {
    config.optimization.splitChunks.cacheGroups = {
      dataGroup: {
        maxSize: 1024 * 1024 * 2,
        test: /data.*\.json$/,
        filename: 'static/js/[name].[contenthash:8].data.js',
      },
    };
  }

  return config;
};
