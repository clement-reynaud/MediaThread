import { Router } from "express";
import * as tagController from "../controllers/tag.controller";
import { requireAdminAuth } from "../controllers/user.controller";

const router = Router();

// API to create a tag
router.post("/create", requireAdminAuth, tagController.createTag);

router.get("/new", requireAdminAuth, async (req, res) => {
  res.render("tags/new");
});

export default router;
