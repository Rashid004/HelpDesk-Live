import { Router } from "express";
import authRoutes from "./auth/auth.routes.js";
import ticketRoutes from "./tickets/ticket.routes.js";
import messageRoutes from "./messages/message.routes.js";
import notificationRoutes from "./notifications/notification.routes.js";
import settingsRoutes from "./settings/settings.routes.js";
import userRoutes from "./users/user.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/tickets", ticketRoutes);
router.use("/messages", messageRoutes);
router.use("/notifications", notificationRoutes);
router.use("/settings", settingsRoutes);
router.use("/users", userRoutes);

export default router;
