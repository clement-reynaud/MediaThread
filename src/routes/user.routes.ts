import { Router } from "express";
import { login, register, logout } from "../controllers/user.controller";

const router = Router();

router.get("/login", (req, res) => {
    const errors = req.session.flashMessages || [];
    req.session.flashMessages = []; // clear after reading
    res.render("users/login", { errors });
});


router.post("/login", login);

router.get("/register", (req, res) => {
	const errors = req.session.flashMessages || [];
	req.session.flashMessages = []; // clear after reading
	res.render("users/register", { errors });
});

router.post("/register", register);

router.get("/logout", logout);
router.post("/logout", logout);

export default router;