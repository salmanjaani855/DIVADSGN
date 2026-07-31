import express from "express";
import {
  listBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadImage,
} from "../controllers/blogController.js";
import { optionalAuthMiddleware, authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", optionalAuthMiddleware, listBlogs);
router.get("/:slug", optionalAuthMiddleware, getBlogBySlug);

router.post("/", authMiddleware, adminMiddleware, createBlog);
router.put("/:id", authMiddleware, adminMiddleware, updateBlog);
router.delete("/:id", authMiddleware, adminMiddleware, deleteBlog);
router.post("/upload-image", authMiddleware, adminMiddleware, upload.single("image"), uploadImage);

export default router;
