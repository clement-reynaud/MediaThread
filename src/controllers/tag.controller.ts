import { Request, Response } from "express";
import * as tagService from "../services/tag.service";

export async function createTag(req: Request, res: Response) {
  const { name, color } = req.body;

  if (!name || !color) {
    return res.status(400).json({ error: "Name and color are required" });
  }

  try {
    const id = await tagService.create(name, color);
    res.json({ id, name, color });
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Tag already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
}
