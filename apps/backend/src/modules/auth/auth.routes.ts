import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authLimiter } from "../../middlewares/rateLimiter.middleware.js";
import { AuthController } from "./auth.controller.js";
import { authService } from "./auth.service.js";

const router = Router();

const controller = new AuthController(authService);

router.post("/signup", authLimiter, controller.signup);
router.post("/login", authLimiter, controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", authenticate, controller.logout);

export default router;
