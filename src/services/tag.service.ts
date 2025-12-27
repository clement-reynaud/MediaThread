import { pool } from "../db/mysql";

export interface Tag {
  id: number;
  name: string;
  color: string;
}

// Get all tags
export async function getAll(): Promise<Tag[]> {
  const [rows] = await pool.query("SELECT id, name, color FROM tags ORDER BY name ASC");
  return rows as Tag[];
}

// Get tags for a specific entry
export async function getTagsForEntry(entryId: number): Promise<Tag[]> {
  const [rows] = await pool.query(
    `SELECT t.id, t.name, t.color
     FROM tags t
     JOIN entry_tags et ON et.tag_id = t.id
     WHERE et.entry_id = ?`,
    [entryId]
  );
  return rows as Tag[];
}

// Create a tag
export async function create(name: string, color: string): Promise<number> {
  const [result] = await pool.query(
    "INSERT INTO tags (name, color) VALUES (?, ?)",
    [name, color]
  );
  const insertResult = result as any;
  return insertResult.insertId;
}

// Assign tags to entry (replace all existing)
export async function setTagsForEntry(entryId: number, tagIds: number[]): Promise<void> {
  await pool.query("DELETE FROM entry_tags WHERE entry_id = ?", [entryId]);
  if (tagIds.length === 0) return;

  const values = tagIds.map(tagId => [entryId, tagId]);
  await pool.query("INSERT INTO entry_tags (entry_id, tag_id) VALUES ?", [values]);
}
