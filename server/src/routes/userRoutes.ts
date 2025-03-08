import { Router } from "express";
import { getUser, getUsers, postUser } from "../controllers/userControllers";

const router = Router();

router.get("/", getUsers);
router.get("/", postUser);
router.get("/:cognitoId", getUser);

export default router;
