import { Router } from "express";

import { getScoreController } from "../controllers/score.controller.js";

const router = Router();

router.post("/compute", getScoreController);

export default router;
