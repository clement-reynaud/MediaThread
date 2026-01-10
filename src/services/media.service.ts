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
  is_draft?: boolean;
}

export interface Comment {
  id: number;
  content: string;
  created_at: Date;
  username: string;
  userColor: string;
}

export async function create(title: string, review: string, rating: number, rating_over: number, clear_time: number, user: number, image_path: string | null, is_draft: boolean): Promise<number> {
  const [result] = await pool.query(
    "INSERT INTO media_entries (title, review, rating, rating_over, clear_time, user, image_path, is_draft) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [title, review, rating, rating_over, clear_time, user, image_path, is_draft ? 1 : 0]
  );
  const insertResult = result as any;
  return insertResult.insertId;
}

export enum ShowMode {
  ALL = "all",
  DRAFT = "draft",
  PUBLISHED = "published"
}

export async function getAll(limit: number | null = null, draft: ShowMode = ShowMode.ALL): Promise<MediaEntry[]> {

  let showModeSql: string = "";

  if(ShowMode.DRAFT === draft) {
    showModeSql = " AND m.is_draft = 1";
  }
  else if(ShowMode.PUBLISHED === draft) {
    showModeSql = " AND m.is_draft = 0";
  }

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
      m.is_draft,
      -- user
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
    WHERE 1 = 1 ${showModeSql}
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
      is_draft: row.is_draft,
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
      m.is_draft,
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
    is_draft: row.is_draft,
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


export async function update(
  id: number,
  data: {
    title?: string;
    review?: string | null;
    rating?: number;
    rating_over?: number;
    clear_time?: number;
    is_draft?: boolean;
  }
): Promise<boolean> {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.title !== undefined) {
    fields.push("title = ?");
    values.push(data.title);
  }

  if (data.review !== undefined) {
    fields.push("review = ?");
    values.push(data.review);
  }

  if (data.rating !== undefined) {
    fields.push("rating = ?");
    values.push(data.rating);
  }

  if (data.rating_over !== undefined) {
    fields.push("rating_over = ?");
    values.push(data.rating_over);
  }

  if (data.clear_time !== undefined) {
    fields.push("clear_time = ?");
    values.push(data.clear_time);
  }

  if (data.is_draft !== undefined) {
    fields.push("is_draft = ?");
    values.push(data.is_draft ? 1 : 0);
  }

  if (fields.length === 0) {
    return false; // rien à mettre à jour
  }

  values.push(id);

  const [result] = await pool.query(
    `UPDATE media_entries SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  const updateResult = result as any;
  return updateResult.affectedRows > 0;
}