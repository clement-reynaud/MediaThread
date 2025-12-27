import dotenv from "dotenv";
import path from "path";

const env = process.env.NODE_ENV || "development";

// load the correct env file based on NODE_ENV
dotenv.config({
  path: env === "production"
    ? path.resolve(process.cwd(), ".env.production")
    : path.resolve(process.cwd(), ".env.development")
});

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}