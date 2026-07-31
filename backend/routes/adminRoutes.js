import express from "express";
import { listUsers } from "../controllers/adminController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/users", authMiddleware, adminMiddleware, listUsers);

export default router;
