import session from "express-session";
import MySQLStore from "express-mysql-session";
import { requireEnv } from "../config/env";

const MySQLSessionStore = MySQLStore(session);

const sessionStore: session.Store = new MySQLSessionStore({
  host: requireEnv("DB_HOST"),
  port: Number(requireEnv("DB_PORT")),
  user: requireEnv("DB_USER"),
  password: requireEnv("DB_PASSWORD"),
  database: requireEnv("DB_NAME"),

  // Optional but recommended
  clearExpired: true,
  checkExpirationInterval: 1000 * 60 * 15, // 15 min
  expiration: 1000 * 60 * 60 * 24 // 24h
});

export default sessionStore;
