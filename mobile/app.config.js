import "dotenv/config";

export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    apiUrl: process.env.EXPO_PUBLIC_API_URL || process.env.API_URL || "http://192.168.1.22:5000/api",
    socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL || process.env.SOCKET_URL || "http://192.168.1.22:5000",
    eas: {
      projectId: "d1e61b8b-d67c-483a-b3ff-2f51e2efbfd1"
    }
  },
});
