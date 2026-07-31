/**
 * Must run after authMiddleware (relies on req.user being set). Blocks any
 * request whose authenticated user is not role "admin".
 */
export const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
