import mysql from "mysql2/promise";
import { requireEnv } from "../config/env";


export const dbConfig = {
  host: requireEnv("DB_HOST"),
  port: Number(requireEnv("DB_PORT")),
  user: requireEnv("DB_USER"),
  password: requireEnv("DB_PASSWORD"),
  database: requireEnv("DB_NAME"),
  waitForConnections: true,
  connectionLimit: 10
};


export const pool = mysql.createPool(dbConfig);