module.exports = ({ config }) => {
  return {
    ...config,
    name: "CogniSUS",

    icon: "./assets/images/app-preview-icon.png",

    ios: {
      ...config.ios,
      bundleIdentifier: config.ios?.bundleIdentifier,
    },

    android: {
      ...config.android,
      package: config.android?.package,

      adaptiveIcon: {
        foregroundImage: "./assets/images/app-preview-icon.png",
      },
    },
  };
};
