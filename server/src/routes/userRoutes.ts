import { Router } from "express";
import {
  getUser,
  getUsers,
  postUser,
  removeProfilePicture,
  updateUser,
} from "../controllers/userControllers";

const router = Router();

router.get("/", getUsers);
router.post("/", postUser);
router.get("/:cognitoId", getUser);
router.put("/:userId", updateUser);
router.delete("/:userId/profile-picture", removeProfilePicture);

export default router;
