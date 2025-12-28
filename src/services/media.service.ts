import { pool } from "../db/mysql";
import * as tagService from "./tag.service";
import * as userService from "./user.service";
import { Tag } from "./tag.service";
import { User } from "./user.service";

export interface MediaEntry {
  id: number;
  title: string;
  review?: string;
  created_at: Date;
  tags?: Tag[];
  rating: number;
  rating_over: number;
  clear_time: number;
  user: User;
  comments?: Comment[];
  image_path?: string;
}

export interface Comment {
  id: number;
  content: string;
  created_at: Date;
  username: string;
  userColor: string;
}

export async function create(title: string, review: string, rating: number, rating_over: number, clear_time: number, user: number, image_path: string | null): Promise<number> {
  const [result] = await pool.query(
    "INSERT INTO media_entries (title, review, rating, rating_over, clear_time, user, image_path) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [title, review, rating, rating_over, clear_time, user, image_path]
  );
  const insertResult = result as any;
  return insertResult.insertId;
}


export async function getAll(limit: number | null = null): Promise<MediaEntry[]> {
  const [rows] = await pool.query(
    `
    SELECT
      m.id AS media_id,
      m.title,
      m.review,
      m.created_at,
      m.rating,
      m.rating_over,
      m.clear_time,
      u.id AS user_id,
      u.username,
      u.password_hash,
      u.created_at AS user_created_at,
      u.is_admin,
      -- aggregate tags
      GROUP_CONCAT(CONCAT(t.id, ':', t.name, ':', t.color) SEPARATOR ',') AS tags,
      m.image_path
    FROM media_entries m
    JOIN users u ON m.user = u.id
    LEFT JOIN entry_tags et ON m.id = et.entry_id
    LEFT JOIN tags t ON et.tag_id = t.id
    GROUP BY m.id
    ORDER BY m.created_at DESC
    ${limit ? `LIMIT ${limit}` : ''}
    `
  );

  return (rows as any[]).map(row => {
    let parsedTags: Tag[] = [];
    if (row.tags) {
      parsedTags = row.tags.split(',').map((t: string) => {
        const [id, name, color] = t.split(':');
        return { id: Number(id), name, color };
      });
    }

    return {
      id: row.media_id,
      title: row.title,
      review: row.review,
      created_at: row.created_at,
      rating: row.rating,
      rating_over: row.rating_over,
      clear_time: row.clear_time,
      user: {
        id: row.user_id,
        username: row.username,
        password_hash: row.password_hash,
        created_at: row.user_created_at,
        is_admin: !!row.is_admin,
      },
      tags: parsedTags,
      image_path: row.image_path
    };
  });
}


export async function getById(id: number): Promise<MediaEntry | null> {
  const [rows] = await pool.query(
    `
    SELECT
      m.id AS media_id,
      m.title,
      m.review,
      m.created_at,
      m.rating,
      m.rating_over,
      m.clear_time,
      u.id AS user_id,
      u.username,
      u.password_hash,
      u.created_at AS user_created_at,
      u.is_admin,
      GROUP_CONCAT(CONCAT(t.id, ':', t.name, ':', t.color) SEPARATOR ',') AS tags,
      m.image_path
    FROM media_entries m
    JOIN users u ON m.user = u.id
    LEFT JOIN entry_tags et ON m.id = et.entry_id
    LEFT JOIN tags t ON et.tag_id = t.id
    WHERE m.id = ?
    GROUP BY m.id
    `,
    [id]
  );

  const row = (rows as any[])[0];
  if (!row) return null;

  let parsedTags: Tag[] = [];
  if (row.tags) {
    parsedTags = row.tags.split(',').map((t: string) => {
      const [id, name, color] = t.split(':');
      return { id: Number(id), name, color };
    });
  }

  const [commentRows] = await pool.query(
    `
    SELECT
      c.id,
      c.content,
      c.created_at,
      u.color,
      u.username
    FROM entry_comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.entry_id = ?
    ORDER BY c.created_at DESC
    `,
    [id]
  );

  const parsedComments: Comment[] = (commentRows as any[]).map(row => ({
    id: row.id,
    content: row.content,
    created_at: row.created_at,
    username: row.username,
    userColor: row.color,
  }));

  return {
    id: row.media_id,
    title: row.title,
    review: row.review,
    created_at: row.created_at,
    rating: row.rating,
    rating_over: row.rating_over,
    clear_time: row.clear_time,
    user: {
      id: row.user_id,
      username: row.username,
      password_hash: row.password_hash,
      created_at: row.user_created_at,
      is_admin: !!row.is_admin,
    },
    comments: parsedComments,
    tags: parsedTags,
    image_path: row.image_path
  };
}

export async function addComment(entry_id: number, content: string, user_id: number) {
  await pool.query(
    "INSERT INTO entry_comments (entry_id, user_id, content) VALUES (?, ?, ?)",
    [entry_id, user_id, content]
  );
}
