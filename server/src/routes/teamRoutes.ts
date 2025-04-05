import { Router } from "express";
import { createTeam, getTeams } from "../controllers/teamControllers";

const router = Router();

router.get("/", getTeams);
router.post("/", createTeam);

export default router;
