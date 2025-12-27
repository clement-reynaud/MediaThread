import { pool } from "../db/mysql";
import * as bcrypt from "bcryptjs";

export interface User {
	id: number;
	username: string;
	password_hash: string;
	created_at: Date;
	is_admin: boolean;
}

export async function getAll(): Promise<User[]> {
  const [rows] = await pool.query("SELECT id, username, password_hash, created_at, is_admin FROM users ORDER BY id ASC");
  return rows as User[];
}

export async function getById(id: number): Promise<User | null> {
  const [rows] = await pool.query(
	"SELECT id, username, password_hash, created_at, is_admin FROM users WHERE id = ?",
	[id]
  );

  const entries = rows as User[];
  return entries[0] ?? null;
}

export async function validateUser(username: string, password: string): Promise<User|null> {
	const user = await getByUsername(username);
	if (!user) return null;
	
	const isValid = await bcrypt.compare(password, user.password_hash);
	if (!isValid) return null;
	
	return user;
}

export async function getByUsername(username: string): Promise<User | null> {
  const [rows] = await pool.query(
	"SELECT id, username, password_hash, created_at, is_admin FROM users WHERE username = ?",
	[username]
  );

  const entries = rows as User[];
  return entries[0] ?? null;
}

export async function create(username: string, password_hash: string): Promise<number> {
  const [result] = await pool.query(
	"INSERT INTO users (username, password_hash) VALUES (?, ?)",
	[username, password_hash]
  );
  const insertResult = result as any;
  return insertResult.insertId;
}