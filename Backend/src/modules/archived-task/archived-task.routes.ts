import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { archivedTasksByDateSchema } from "./archived-task.validation.js";
import { getArchivedTasksByDate, getArchivedDates } from "./archived-task.controller.js";

const router = Router();

router.use(verifyJWT);

router.get("/dates", getArchivedDates);
router.get("/history", validateRequest(archivedTasksByDateSchema), getArchivedTasksByDate);

export default router;