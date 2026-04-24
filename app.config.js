const API_URL = process.env.API_URL ?? process.env.EXPO_PUBLIC_API_URL;
const API_KEY = process.env.API_KEY ?? process.env.EXPO_PUBLIC_API_KEY;

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    recordCollectionApiUrl: API_URL,
    recordCollectionApiKey: API_KEY,
  },
});
