import express from "express";
import path from "path";
import expressLayouts from "express-ejs-layouts";
import session from "express-session";
import sessionStore from "./db/session";
import i18nMiddleware from "./middleware/i18n";

const app = express();
app.use(i18nMiddleware);

app.use((req, res, next) => {
  res.locals.t = req.t;
  res.locals.lang = req.language;
  next();
});

app.set("trust proxy", 1);

app.use(session({
  name: "session",
  secret: process.env.SESSION_SECRET!,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  }
}));

app.use(express.static(path.resolve(__dirname, '../public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use((req, res, next) => {
  res.locals.userId = req.session.userId || null;
  res.locals.isAdmin = req.session.isAdmin || false;
  
  next();
});

app.use(expressLayouts);
app.set("layout", "layout"); // points to views/layout.ejs

app.get("/", (req, res) => res.redirect("/media"));

app.get("/lang/:lng/:current", (req, res) => {
  res.cookie("i18next", req.params.lng);
  res.redirect("/media");
});

import mediaRoutes from "./routes/media.routes";
app.use("/media", mediaRoutes);

import tagRoutes from "./routes/tag.routes";
app.use("/tags", tagRoutes);

import userRoutes from "./routes/user.routes";
app.use("/users", userRoutes);



export default app;
