import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Requires a valid `Authorization: Bearer <token>` header. Verifies the JWT,
 * loads the user from the DB, and attaches it to `req.user`. Responds 401 on
 * any failure (missing header, invalid/expired token, user no longer exists).
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, invalid or expired token" });
  }
};

/**
 * Same as authMiddleware but never blocks the request -- used on public
 * routes (blog list/detail) that need to know the viewer's plan *if* they
 * happen to be logged in, while still working for anonymous visitors.
 * Anonymous visitors fall through with `req.user` left undefined, which the
 * access-control helper treats as "free" rank.
 */
export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme === "Bearer" && token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) req.user = user;
    }
  } catch (err) {
    // Invalid/expired token on an optional route just means "treat as anonymous".
  }
  next();
};
