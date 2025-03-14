import { Router } from "express";
import {
  createTask,
  deleteTask,
  editTask,
  getTasks,
  getUserTasks,
  updateTaskStatus,
} from "../controllers/taskControllers";

const router = Router();

router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:taskId/status", updateTaskStatus);
router.get("/user/:userId", getUserTasks);
router.delete("/:id", deleteTask);
router.put("/:id", editTask);

export default router;
