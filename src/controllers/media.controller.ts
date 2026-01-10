import { Request, Response } from "express";
import * as tagService from "../services/tag.service";
import * as mediaService from "../services/media.service";

/**
 * GET /media
 */
export async function listEntries(req: Request, res: Response) {
  const entries = await mediaService.getAll(null, mediaService.ShowMode.PUBLISHED);
  res.render("media/list", { entries });
}

export async function listDrafts(req: Request, res: Response) {
  const entries = await mediaService.getAll(null, mediaService.ShowMode.DRAFT);
  res.render("media/list", { entries });
}

/**
 * GET /media/new
 */
export async function renderNewForm(req: Request, res: Response) {
  const tags = await tagService.getAll();
  res.render("media/new", { tags });
}
/**
 * POST /media
 */
export async function createEntry(req: Request, res: Response) {
  const { title, review, tags: tagIds, rating, rating_over, clear_time} = req.body;

  const is_draft = req.body.is_draft ? true : false;

  if (!title) {
    return res.status(400).send("Title is required");
  }
  

  const imagePath = req.file
    ? `uploads/media/${req.file.filename}`
    : null;

  let ratingNumer = Number(rating);
  let ratingOver = Number(rating_over);

  const entryId = await mediaService.create(title, review, ratingNumer, ratingOver, clear_time ,req.session.userId ?? 0, imagePath, is_draft);
  
  if (tagIds) {
    const tagIdsArray = Array.isArray(tagIds) ? tagIds.map(Number) : [Number(tagIds)];
    await tagService.setTagsForEntry(entryId, tagIdsArray);
  }

  res.redirect("/media");
}

/**
 * GET /media/:id
 */
export async function getEntry(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).send("Invalid entry id");
  }

  const entry = await mediaService.getById(id);

  if (!entry) {
    return res.status(404).send("Entry not found");
  }

  res.render("media/detail", { entry });
}

export async function createComment(req: Request, res: Response) {
  const { comment } = req.body;
  const entryId = Number(req.params.id);
  await mediaService.addComment(entryId, comment, req.session.userId ?? 0);
  res.redirect(`/media/${entryId}`);
}

// edit

export async function renderEditForm(req: Request, res: Response) {
  const id = Number(req.params.id);
  const entry = await mediaService.getById(id);
  if (!entry) {
    return res.status(404).send("Entry not found");
  }
  const tags = await tagService.getAll();
  res.render("media/edit", { entry, tags });
}

export async function updateEntry(req: Request, res: Response) {
  const { id, title, review, tags: tagIds, rating, rating_over, clear_time} = req.body;

  const is_draft = req.body.is_draft ? true : false;

  let data = {};
  if (title) data = { ...data, title };
  if (review) data = { ...data, review };
  if (rating) data = { ...data, rating };
  if (rating_over) data = { ...data, rating_over };
  if (clear_time) data = { ...data, clear_time };
  
  data = { ...data, is_draft };

  const entry = await mediaService.getById(id);
  if (!entry) {
    return res.status(404).send("Entry not found");
  }

  mediaService.update(id, data);

  if (tagIds) {
    const tagIdsArray = Array.isArray(tagIds) ? tagIds.map(Number) : [Number(tagIds)];
    await tagService.setTagsForEntry(id, tagIdsArray);
  }

  res.redirect(id);
}