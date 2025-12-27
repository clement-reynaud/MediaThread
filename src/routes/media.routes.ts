import { Router } from "express";
import {
  listEntries,
  renderNewForm,
  createEntry,
  getEntry,
  createComment
} from "../controllers/media.controller";
import { requireAdminAuth, requireAuth } from "../controllers/user.controller";

const router = Router();

router.get("/", listEntries);
router.get("/new",requireAdminAuth, renderNewForm);
router.post("/",requireAdminAuth, createEntry);
router.get("/:id", getEntry);
router.post("/:id/comment", requireAuth, createComment);

export default router;
