import { Router } from "express";
import { createTaskSchema, taskIdParamSchema, updateTaskSchema } from "./task.validation.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { createTask, getTaskById, getTodayTasks, updateTask, deleteTask } from "./task.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";



const router = Router();

router.use(verifyJWT);

router.post("/", validateRequest(createTaskSchema), createTask);
router.get("/today", getTodayTasks);
router.get("/:id", validateRequest(taskIdParamSchema), getTaskById);
router.patch("/:id", validateRequest(updateTaskSchema), updateTask);
router.delete("/:id", deleteTask);





export default router;