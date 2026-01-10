import { Router } from "express";
import {
  listEntries,
  renderNewForm,
  createEntry,
  getEntry,
  createComment,
  updateEntry,
  renderEditForm,
  listDrafts
} from "../controllers/media.controller";
import { requireAdminAuth, requireAuth } from "../controllers/user.controller";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/", listEntries);
router.get("/drafts", listDrafts);
router.get("/new",requireAdminAuth, renderNewForm);
router.post("/",requireAdminAuth, upload.single("image") ,createEntry);
router.get("/:id", getEntry);
router.post("/:id/comment", requireAuth, createComment);

router.get('/:id/edit', requireAdminAuth, renderEditForm);
router.post('/:id', requireAdminAuth, updateEntry);


export default router;
