import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { UserController } from "./user.controller.js";
import { userService } from "./user.service.js";

const router = Router();

const controller = new UserController(userService);

router.use(authenticate);

router.get("/me", controller.getMe);
router.patch("/me", controller.updateMe);
router.patch("/me/password", controller.changePassword);
router.patch("/me/shift", authorize("agent"), controller.toggleShift);

router.get("/", authorize("agent"), controller.getUserList);
router.get("/agents/:department", authorize("agent"), controller.getListAgentsByDepartment);
router.get("/:id", authorize("agent"), controller.getById);

router.patch("/:id/status", authorize("agent"), controller.updateStatus);

export default router;
