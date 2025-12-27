import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: number;  
    isAdmin?: boolean;
    flashMessages?: Array<string> | null;
  }
}
