import { NextFunction, Request, Response } from "express";
import * as userService from "../services/user.service";
import * as bcrypt from "bcryptjs";

export async function login(req: Request, res: Response) {
	const { username, password } = req.body;
	
	if (!username || !password) {
		return res.render("users/login", {
			errors: ["errors.credentials_required"]
		});
	}
	
	const user = await userService.validateUser(username, password);
	
	if (!user) {
		return res.render("users/login", {
			errors: ["errors.invalid_credentials"]
		});
	}
	
	req.session.userId = user.id;
	req.session.isAdmin = user.is_admin;

  req.session.save((err) => {
          if (err) console.error(err);
          return res.redirect("/media");
  });
}

export async function register(req: Request, res: Response) {
  const { username, password, password_confirm } = req.body;

  if (!username || !password || !password_confirm) {
    return res.render("users/register", { errors: ["errors.credentials_required"] });
  }

  if (password !== password_confirm) {
    return res.render("users/register", { errors: ["errors.password_mismatch"] });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    req.session.userId = await userService.create(username, hashed);
    res.redirect("/media");
  } catch (err: any) {
    // Handle duplicate username gracefully
    if (err.message.includes("Username already exists") || err.code === "ER_DUP_ENTRY") {
      return res.render("users/register", { errors: ["errors.username_taken"] });
    }

    // Unexpected errors
    console.error(err);
    return res.status(500).render("users/register", { errors: ["errors.unknown"] });
  }
}

export async function logout(req: Request, res: Response) {
  req.session.destroy(err => {
    if (err) {
      console.error("Failed to destroy session during logout:", err);
      return res.status(500).send("Failed to log out");
    }

    // Clear cookie on client
    res.clearCookie("session");
    res.redirect("/users/login");
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.session.userId) {
        // initialize the array if needed
        if (!req.session.flashMessages) req.session.flashMessages = [];
        req.session.flashMessages.push("You must log in to access that page");
        req.session.save((err) => {
            if (err) console.error(err);
            return res.redirect("/users/login");
        });
        return; 
    }
    req.userId = req.session.userId;
    next();
}

export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  	if (!req.session.userId || !req.session.isAdmin) {
        // initialize the array if needed
        if (!req.session.flashMessages) req.session.flashMessages = [];
        req.session.flashMessages.push("You must log in as an admin to access that page");
        req.session.save((err) => {
            if (err) console.error(err);
            return res.redirect("/users/login");
        });
        return;
	}
  req.userId = req.session.userId;
  next();
}