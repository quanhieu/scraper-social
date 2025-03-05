export default () => ({
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
  database: {
    mongodb_uri: process.env.MONGODB_URI,
  },
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY,
  },
  tiktok: {
    clientKey: process.env.TIKTOK_CLIENT_KEY,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
  },
  password: {
    password: process.env.PASSWORD,
  },
});
