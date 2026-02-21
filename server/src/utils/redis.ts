import { Redis } from "@upstash/redis";

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!UPSTASH_URL || !UPSTASH_TOKEN) {
  throw new Error(
    "Missing Redis configuration: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN " +
      "must be set in environment variables."
  );
}

const redis = new Redis({
  url: UPSTASH_URL,
  token: UPSTASH_TOKEN,
});

export default redis;
