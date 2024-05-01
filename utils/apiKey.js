import configDotenv from "dotenv";
configDotenv.config();

const apiKeys = new Set();

apiKeys.add(process.env.APIKEY);

export default apiKeys;
