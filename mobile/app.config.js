import "dotenv/config";

export default ({ config }) => ({
  ...config,

  extra: {
    ...config.extra,

    apiUrl:
      process.env.EXPO_PUBLIC_API_URL ||
      "https://safetrack-api.onrender.com/api",

    socketUrl:
      process.env.EXPO_PUBLIC_SOCKET_URL ||
      "https://safetrack-api.onrender.com",
  },
});