import { Router } from "express";
import {
  getUser,
  getUsers,
  postUser,
  updateUser,
} from "../controllers/userControllers";

const router = Router();

router.get("/", getUsers);
router.post("/", postUser);
router.get("/:cognitoId", getUser);
router.put("/:userId", updateUser);

export default router;
